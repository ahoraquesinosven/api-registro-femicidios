import {OpenApiRouter} from "../openapi/index.js";
import {securitySchemes} from "../openapi/securitySchemes.js";
import knex from "../services/knex.js";

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
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["occurredAt", "province", "location", "place", "newsLinks", "victim", "aggressor", "category"],

            properties: {
              category: { $ref: "#/components/schemas/CaseCategory" },
              occurredAt: { type: "string", format: "date" },
              momentOfDay: { $ref: "#/components/schemas/CaseMomentOfDay" },
              province: { $ref: "#/components/schemas/Province" },
              location: { type: "string", minLength: 5 },
              geographicLocation: { $ref: "#/components/schemas/CaseGeographicLocation" },
              place: { $ref: "#/components/schemas/CasePlace" },
              murderWeapon: { $ref: "#/components/schemas/CaseMurderWeapon" },
              hadLegalComplaints: { type: "boolean" },
              wasJudicialized: { type: "boolean" },
              judicialMeasures: { type: "array", items: { $ref: "#/components/schemas/CaseJudicialMeasure" } },
              victimBondAggressor: { $ref: "#/components/schemas/CaseVictimBondAggressor" },
              isRape: { type: "boolean" },
              isRelatedToOrganizedCrime: { type: "boolean" },
              organizedCrimeNotes: { type: "string" },
              generalNotes: { type: "string" },
              newsLinks: { type: "array", items: { type: "string" }, minItems: 1, "uniqueItems": true },



              victim: {
                type: "object",
                properties: {
                  fullName: { type: "string", minLength: 5 },
                  age: { type: "integer" },
                  gender: { $ref: "#/components/schemas/Gender" },
                  nationality: { $ref: "#/components/schemas/Nationality" },
                  isSexualWorker: { type: "boolean" },
                  isMissingPerson: { type: "boolean" },
                  isNativePeople: { type: "boolean" },
                  isPregnant: { type: "boolean" },
                  hasDisabillity: { type: "boolean" },
                  occupation: { type: "string" },
                  hasChildren: { type: "boolean" },
                  numberOfChildren: { type: "integer" },
                },
                additionalProperties: false,
              },

              aggressor: {
                type: "object",
                properties: {
                  fullName: { type: "string", minLength: 5 },
                  age: { type: "integer" },
                  gender: { $ref: "#/components/schemas/Gender" },
                  hasLegalComplaintHistory: { type: "boolean" },
                  hasPreviousCases: { type: "boolean" },
                  wasInPrison: { type: "boolean" },
                  behaviourPostCase: { $ref: "#/components/schemas/CaseAggressorBehaviorPostCase" },
                  belongsSecurityForce: { type: "boolean" },
                  securityForce: { $ref: "#/components/schemas/CaseAggressorSecurityForce" },
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
      422: { $ref: "#/components/responses/ValidationError" },
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
            "caseCategory",
            "occurredAt",
            "momentOfDay",
            "province",
            "location",
            "geographicLocation",
            "place",
            "murderWeapon",
            "wasJudicialized",
            "judicialMeasures",
            "hadLegalComplaints",
            "isRape",
            "isRelatedToOrganizedCrime",
            "organizedCrimeNotes",
            "generalNotes",
            "newsLinks",
            "victimBondAggressor",
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
