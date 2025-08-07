import { OpenApiRouter, securitySchemes } from "../openapi.js";
import knex from "../services/knex.js";
import provinces from "../data/provinces.js";
import geographicLocations_list from "../data/geographicLocations.js";


const router = new OpenApiRouter({  
  prefix: "/v1/cases",
});

const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => k in (obj || {})).map((k) => [k, obj[k]]),
  );

router.operation({
  method: "post",
  relativePath: "/",
  spec: {
    tags: ["cases"],
    summary: "Create a new case",
    security: [securitySchemes.oauth],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: [ "occurredAt", "province", "location", "place", "murderWeapon","newsLinks","victim", "aggressor"],  

            properties: {
              occurredAt: { type: "string", format: "date" },
              momentOfDay: { type: "string" },
              province: { enum: provinces },
              location: { type: "string", minLength: 5 },
              geographicLocation: { enum: geographicLocations_list},
              place: { type: "string", minLength: 2 },
              murderWeapon: { type: "string", minLength: 2 },
              wasJudicialized: { type: "boolean" },
              hadLegalComplaints: { type: "boolean" },
              isRape: { type: "boolean" },
              isRelatedToOrganizedCrime: { type: "boolean" },
              organizedCrimeNotes: { type: "string" },
              generalNotes: { type: "string" },
              newsLinks: { type: "array", items: { type: "string" } ,   minItems: 1, "uniqueItems": true},

              victim: {
                type: "object",
                properties: {
                  fullName: { type: "string", minLength: 5 },
                  age: { type: "integer" },
                  gender: { type: "string", minLength: 2 },
                  nationality: { type: "string", minLength: 3, maxLength: 3 },
                  isSexualWorker: { type: "boolean" },
                  isMissingPerson: { type: "boolean" },
                  isNativePeople: { type: "boolean" },
                  isPregnant: { type: "boolean" },
                  hasDisabillity: { type: "boolean" },
                  occupation: { type: "string" },
                  hasChildren: { type: "boolean" },
                },
                additionalProperties: false,
              },

              aggressor: {
                type: "object",
                properties: {
                  fullName: { type: "string", minLength: 5 },
                  age: { type: "integer" },
                  gender: { type: "string" },
                  hasLegalComplaintHistory: { type: "boolean" },
                  hasPreviousCases: { type: "boolean" },
                  wasInPrison: { type: "boolean" },
                  behaviourPostCase: { type: "string" },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Case created successfully",
      },
      422: {
        description: "Bad request",
      },
    },
  },
  handlers: [
    async (ctx) => {
      const body = ctx.request.body;
      //TODO validaciones mas complejas

      await knex.transaction(async (trx) => {
        const [{ id: victimId }] = await trx("victims")
          .insert(body.victim)
          .returning("id");

        const [{ id: aggressorId }] = await trx("aggressors")
          .insert(body.aggressor)
          .returning("id");

        await trx("cases").insert({
          ...pick(body, [
            "occurredAt",
            "momentOfDay",
            "province",
            "location",
            "geographicLocation",
            "place",
            "murderWeapon",
            "wasJudicialized",
            "hadLegalComplaints",
            "isRape",
            "isRelatedToOrganizedCrime",
            "organizedCrimeNotes",
            "generalNotes",
            "newsLinks",
          ]),
          aggressorId,
          victimId,
        });
      });

      ctx.status = 201;
    },
  ],
});

router.operation({
  method: "get",
  relativePath: "/",
  spec: {
    tags: ["cases"],
    summary: "List all cases",
    security: [securitySchemes.oauth],
    parameters: [],
    responses: {
      200: {
        description: "List of cases",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  victimName: { type: "string" },
                  province: { type: "string" },
                  location: { type: "string" },
                  aggressor: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  handlers: [
    async (ctx) => {
      const cases = await knex("cases")
        .join("victims", "cases.victimId", "victims.id")
        .join("aggressors", "cases.aggressorId", "aggressors.id")
        .select(
          "cases.id",
          "victims.fullName as victimName",
          "cases.province",
          "cases.location",
          "aggressors.fullName as aggressor",
        );

      ctx.body = cases;
    },
  ],
});

export default router.nativeRouter;
