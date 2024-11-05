import { OpenApiRouter } from "../openapi.js";
import { requireUserAuth } from "../middleware/auth.js";
import knex from "../services/knex.js";

const router = new OpenApiRouter({
  prefix: "/v1/cases",
});

const pick = (obj, keys) => Object.fromEntries(
  keys
    .filter(k => k in obj)
    .map(k => [k, obj[k]])
);

router.operation({
  relativePath: "/",
  method: "post",
  spec: {
    tags: ["cases"],
    summary: "Create a new case",
    security: [{"oauth": []}],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              occurredAt: { type: "string", format: "date" },
              momentOfDay: { type: "string" },
              province: { type: "string" },
              location: { type: "string" },
              geographicLocation: { type: "string" },
              place: { type: "string" },
              murderWeapon: { type: "string" },
              wasJudicialized: { type: "boolean" },
              hadLegalComplaints: { type: "boolean" },
              isRape: { type: "boolean" },
              isRelatedToOrganizedCrime: { type: "boolean" },
              organizedCrimeNotes: { type: "string" },
              generalNotes: { type: "string" },
              newsLinks: { type: "array", items: { type: "string" } },

              victim: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  age: { type: "integer" },
                  gender: { type: "string" },
                  nationality: { type: "string", minLength: 3, maxLength: 3 },
                  isSexualWorker: { type: "boolean" },
                  isMissingPerson: { type: "boolean" },
                  isNativePeople: { type: "boolean" },
                  isPregnant: { type: "boolean" },
                  hasDisabillity: { type: "boolean" },
                  occupation: { type: "string" },
                  hasChildren: { type: "boolean" },
                },
              },

              aggressor: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  age: { type: "integer" },
                  gender: { type: "string" },
                  hasLegalComplaintHistory: { type: "boolean" },
                  hasPreviousCases: { type: "boolean" },
                  wasInPrison: { type: "boolean" },
                  behaviourPostCase: { type: "string" },
                },
              },
            },
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
    requireUserAuth,
    async (ctx) => {
      const body = ctx.request.body;

      await knex.transaction(async (trx) => {
        const [{id: victimId}] = await trx("victims")
          .insert(pick(body.victim, [
            "fullName",
            "age",
            "gender",
            "nationality",
            "isSexualWorker",
            "isMissingPerson",
            "isNativePeople",
            "isPregnant",
            "hasDisabillity",
            "occupation",
            "hasChildren",
          ]))
          .returning("id");

        const [{id: aggressorId}] = await trx("aggressors")
          .insert(pick(body.aggressor, [
            "fullName",
            "age",
            "gender",
            "hasLegalComplaintHistory",
            "hasPreviousCases",
            "wasInPrison",
            "behaviourPostCase",
          ]))
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

export default router.nativeRouter;
