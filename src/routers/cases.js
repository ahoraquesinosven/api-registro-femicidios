import { OpenApiRouter, securitySchemes } from "../openapi.js";
import knex from "../services/knex.js";
import provinces from "../data/provinces.js";
import geographicLocationsList from "../data/geographicLocations.js";
import casePlaceList from "../data/places.js";
import murderWeaponList from "../data/murderWeapons.js";
import genderList from "../data/genders.js";
import nationalityList from "../data/nationalities.js";
import behavioursPostCaseList from "../data/behavioursPostCase.js";
import momentOfDayList from "../data/momentsOfDay.js";
import victimBondAggressor from "../data/victimBondAggressor.js";
import caseCategories from "../data/caseCategories.js";
import judicialMeasures from "../data/judicialMeasures.js"
import momentOfDayList from "../data/momentsOfDay.js";
import securityForcesList from "../data/securityForces.js";


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
            required: [ "occurredAt", "province", "location", "place", "newsLinks","victim", "aggressor", "caseCategory"],  

            properties: {
              caseCategory:{enum: caseCategories},
              occurredAt: { type: "string", format: "date" },
              momentOfDay: { enum: momentOfDayList },
              province: { enum: provinces },
              location: { type: "string", minLength: 5 },
              geographicLocation: { enum: geographicLocationsList},
              place: { enum: casePlaceList},
              murderWeapon: { enum: murderWeaponList},
              hadLegalComplaints: { type: "boolean" },
              wasJudicialized: { type: "boolean" }, //habia alguna medida judicial
              judicialMeasures: {type: "array", items: { enum:judicialMeasures }},
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
                  gender: { enum:genderList },              
                  nationality: { enum:nationalityList },
                  isSexualWorker: { type: "boolean" },
                  isMissingPerson: { type: "boolean" },
                  isNativePeople: { type: "boolean" },
                  isPregnant: { type: "boolean" },
                  hasDisabillity: { type: "boolean" },
                  occupation: { type: "string" },
                  hasChildren: { type: "boolean" },
                  numberOfChildren: {type: "integer"},
                  victimBondAggressor: {enum:victimBondAggressor},
                },
                additionalProperties: false,
              },

              aggressor: {
                type: "object",
                properties: {
                  fullName: { type: "string", minLength: 5 },
                  age: { type: "integer" },
                  gender: { enum:genderList },
                  hasLegalComplaintHistory: { type: "boolean" },
                  hasPreviousCases: { type: "boolean" },
                  wasInPrison: { type: "boolean" },
                  behaviourPostCase: { enum: behavioursPostCaseList },
                  belongsSecurityForce: { type: "boolean" },
                  securityForce: {enum:securityForcesList},
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
