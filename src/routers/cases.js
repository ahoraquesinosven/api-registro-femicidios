import { OpenApiRouter } from "../openapi/index.js";
import { securitySchemes } from "../openapi/securitySchemes.js";
import knex from "../services/knex.js";

const router = new OpenApiRouter({
  prefix: "/v1/cases",
});

const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => k in (obj || {})).map((k) => [k, obj[k]]),
  );

const caseValidations = (body) => {
  const errors = [];

  if (body.organizedCrimeNotes && !body.isRelatedToOrganizedCrime) {
    errors.push({
      "type": "body",
      "path": "/isRelatedToOrganizedCrime",
      "message": "Debe ser verdadero si hay notas de crimen organizado",
    });
  }

  if (!body.organizedCrimeNotes && body.isRelatedToOrganizedCrime) {
    errors.push({
      "type": "body",
      "path": "/organizedCrimeNotes",
      "message": "Debe completarse notas adicionales si es un caso relacionado con el crimen organizado",
    });
  }

  if (body.victim.ageOfChildren && (body.victim.numberOfChildren < body.victim.ageOfChildren.length)) {
    errors.push({
      "type": "body",
      "path": "/victim.numberOfChildren",
      "message": "La cantidad de hijxs no puede ser menor a la cantidad de edades proporcionadas",
    });
  }

  if (body.totalLegalComplaints && !body.hadLegalComplaints) {
    errors.push({
      "type": "body",
      "path": "/hadLegalComplaints",
      "message": "Debe ser verdadero is se completo la cantidad de denuncias",
    });
  }

  if (body.wasJudicialized && !body.hadLegalComplaints) {
    errors.push({
      "type": "body",
      "path": "/hadLegalComplaints",
      "message": "Debe ser verdadero si tiene medidas judiciales",
    });
  }

  if (body.judicialMeasures && !body.wasJudicialized) {
    errors.push({
      "type": "body",
      "path": "/wasJudicialized",
      "message": "Debe ser verdadero si tiene al menos una medidas judicial seleccionada",
    });
  }

  //victim validations
  if (body.victim.numberOfChildren && !body.victim.hasChildren) {
    errors.push({
      "type": "body",
      "path": "/victim.hasChildren",
      "message": "Debe ser verdadero si tiene al menos un hijx",
    });
  }

  if (body.victim.ageOfChildren && !body.victim.numberOfChildren && !body.victim.hasChildren) {
    errors.push({
      "type": "body",
      "path": "/victim.hasChildren",
      "message": "Debe ser verdadero si se cargo al menos una edad de al menos un hijx",
    });
  }

  //aggresor validations
  if (body.aggressor.securityForce && !body.aggressor.belongsSecurityForce) {
    errors.push({
      "type": "body",
      "path": "/aggressor.belongsSecurityForce",
      "message": "Debe ser verdadero si se selecciona al menos una fuerza de seguridad",
    });
  }

  return errors;
}

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
          schema: { $ref: "#/components/schemas/Case" },
        },
      },
    },
    responses: {
      201: {
        description: "Case created successfully",
      },
      422: { $ref: "#/components/responses/ValidationErrorResponse" },
    },
  },
  handlers: [
    async (ctx) => {
      const body = ctx.request.body;
      const errors = caseValidations(body);

      if (errors.length > 0) {
        ctx.status = 422;
        ctx.body = errors;
        return;
      }


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
            "wasItAnAttempt",
            "isInsufficientDataOrUnderInvestigation",
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
            "totalLegalComplaints",
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
    parameters: [
      {
        name: "fromDate",
        in: "query",
        schema: { type: "string", format: "date" },
      },
      {
        name: "toDate",
        in: "query",
        schema: { type: "string", format: "date" },
      },
      {
        name: "province",
        in: "query",
        schema: { $ref: "#/components/schemas/Province" },
      },
      {
        name: "location",
        in: "query",
        schema: { type: "string" },
      },
      {
        name: "caseCategory",
        in: "query",
        schema: { $ref: "#/components/schemas/CaseCategory" },
      },
      {
        name: "victimFullName",
        in: "query",
        schema: { type: "string" },
      },
      {
        name: "murderWeapon",
        in: "query",
        schema: { $ref: "#/components/schemas/CaseMurderWeapon" },
      },
      {
        name: "aggressorFullName",
        in: "query",
        schema: { type: "string" },
      },
      {
        name: "victimBondAggressor",
        in: "query",
        schema: { $ref: "#/components/schemas/CaseVictimBondAggressor" },
      },
    ],
    responses: {
      200: {
        description: "List of cases",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: [
                  "id", "occurredAt", "province", "victim", "aggressor", "caseCategory",
                ],
                properties: {
                  id: { type: "integer" },
                  caseCategory: { $ref: "#/components/schemas/Case/properties/caseCategory" },
                  occurredAt: { $ref: "#/components/schemas/Case/properties/occurredAt" },
                  province: { $ref: "#/components/schemas/Case/properties/province" },
                  location: { $ref: "#/components/schemas/Case/properties/location" },
                  murderWeapon: { $ref: "#/components/schemas/Case/properties/location" },
                  victimBondAggressor: { $ref: "#/components/schemas/CaseMurderWeapon" },
                  victim: {
                    type: "object",
                    properties: {
                      fullName: { $ref: "#/components/schemas/Case/properties/victim/properties/fullName" },
                      age: { $ref: "#/components/schemas/Case/properties/victim/properties/age" },
                    },
                  },
                  aggressor: {
                    type: "object",
                    properties: {
                      fullName: { $ref: "#/components/schemas/Case/properties/aggressor/properties/fullName" },
                      age: { $ref: "#/components/schemas/Case/properties/aggressor/properties/age" },
                    },
                  },
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
      const rows = await knex("cases")
        .join("victims", "cases.victimId", "victims.id")
        .join("aggressors", "cases.aggressorId", "aggressors.id")
        .where((builder) => {
          if (ctx.query.fromDate) {
            builder.where("cases.occurredAt", ">=", ctx.query.fromDate);
          }
          if (ctx.query.toDate) {
            builder.where("cases.occurredAt", "<", ctx.query.toDate);
          }
          if (ctx.query.province) {
            builder.where("cases.province", ctx.query.province);
          }
          if (ctx.query.location) {
            builder.whereRaw('unaccent("cases"."location") ILIKE unaccent(?)', `%${ctx.query.location}%`)
          }
          if (ctx.query.caseCategory) {
            builder.where("cases.caseCategory", ctx.query.caseCategory);
          }
          if (ctx.query.victimFullName) {
            builder.whereRaw('unaccent("victims"."fullName") ILIKE unaccent(?)', `%${ctx.query.victimFullName}%`)
          }
          if (ctx.query.murderWeapon) {
            builder.where("cases.murderWeapon", ctx.query.murderWeapon);
          }
          if (ctx.query.aggressorFullName) {
            builder.whereRaw('unaccent("aggressors"."fullName") ILIKE unaccent(?)', `%${ctx.query.aggressorFullName}%`)
          }
          if (ctx.query.victimBondAggressor) {
            builder.where("cases.victimBondAggressor", ctx.query.victimBondAggressor);
          }
        })
        .orderBy("occurredAt", "asc")
        .select({
          id: "cases.id",
          caseCategory: "cases.caseCategory",
          occurredAt: "cases.occurredAt",
          province: "cases.province",
          location: "cases.location",
          murderWeapon: "cases.murderWeapon",
          victimBondAggressor: "cases.victimBondAggressor",
          victimFullName: "victims.fullName",
          victimAge: "victims.age",
          aggressorFullName: "aggressors.fullName",
          aggressorAge: "aggressors.age"
        });

      const cases = rows.map((row) => ({
        id: row.id,
        caseCategory: row.caseCategory,
        occurredAt: row.occurredAt,
        province: row.province,
        location: row.location,
        murderWeapon: row.murderWeapon,
        victimBondAggressor: row.victimBondAggressor,
        victim: {
          fullName: row.victimFullName,
          age: row.victimAge,
        },
        aggressor: {
          fullName: row.aggressorFullName,
          age: row.aggressorAge,
        },
      }));

      ctx.body = cases;
    },
  ],
});

router.operation({
  method: "put",
  relativePath: "/{caseId}",
  spec: {
    tags: ["cases"],
    summary: "Update a case",
    security: [securitySchemes.oauth],
    parameters: [{
      in: "path",
      name: "caseId",
      required: true,
      description: "ID of the case",
      schema: {
        type: "integer",
        minimum: 1
      }
    }],

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Case" },
        },
      },
    },
    responses: {
      201: {
        description: "Case updated successfully",
      },
      422: { $ref: "#/components/responses/ValidationErrorResponse" },
    },
  },
  handlers: [
    async (ctx) => {
      const body = ctx.request.body;
      const errors = caseValidations(body);

      if (errors.length > 0) {
        ctx.status = 422;
        ctx.body = errors;
        return;
      }

      const ids = await knex('cases').where('id', ctx.params.caseId).select("victimId", "aggressorId");

      await knex.transaction(async (trx) => {
        await trx("victims")
          .where('id', ids[0].victimId)
          .update(body.victim);

        await trx("aggressors")
          .where('id', ids[0].aggressorId)
          .update(body.aggressor);

        await trx("cases")
          .where('id', ctx.params.caseId)
          .update({
            ...pick(body, [
              "caseCategory",
              "wasItAnAttempt",
              "isInsufficientDataOrUnderInvestigation",
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
              "totalLegalComplaints",
              "isRape",
              "isRelatedToOrganizedCrime",
              "organizedCrimeNotes",
              "generalNotes",
              "newsLinks",
              "victimBondAggressor",
            ]),
          });
      });

      ctx.status = 201;
    },
  ],
});

router.operation({
  method: "get",
  relativePath: "/{caseId}",
  spec: {
    tags: ["cases"],
    summary: "Get a case by id",
    security: [securitySchemes.oauth],
    parameters: [{
      in: "path",
      name: "caseId",
      required: true,
      description: "ID of the case",
      schema: {
        type: "integer",
        minimum: 1
      }
    }],
    responses: {
      200: {
        description: "Case, victim and agreesor retrieved successfully",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Case" },
          },
        },
      },
    },
  },
  handlers: [
    async (ctx) => {
      const cases = await knex("cases").join("victims", "cases.victimId", "victims.id")
        .join("aggressors", "cases.aggressorId", "aggressors.id")
        .where('cases.id', ctx.params.caseId)
        .select({
          id: "cases.id",
          caseCategory: "cases.caseCategory",
          wasItAnAttempt: "cases.wasItAnAttempt",
          isInsufficientDataOrUnderInvestigation: "cases.isInsufficientDataOrUnderInvestigation",
          occurredAt: "cases.occurredAt",
          momentOfDay: "cases.momentOfDay",
          province: "cases.province",
          location: "cases.location",
          geographicLocation: "cases.geographicLocation",
          place: "cases.place",
          murderWeapon: "cases.murderWeapon",
          hadLegalComplaints: "cases.hadLegalComplaints",
          totalLegalComplaints: "cases.totalLegalComplaints",
          wasJudicialized: "cases.wasJudicialized",
          judicialMeasures: "cases.judicialMeasures",
          victimBondAggressor: "cases.victimBondAggressor",
          isRape: "cases.isRape",
          isRelatedToOrganizedCrime: "cases.isRelatedToOrganizedCrime",
          organizedCrimeNotes: "cases.organizedCrimeNotes",
          generalNotes: "cases.generalNotes",
          newsLinks: "cases.newsLinks",

          //Victim
          victimFullName: "victims.fullName",
          victimAge: "victims.age",
          victimGender: "victims.gender",
          victimIsSexualWorker: "victims.isSexualWorker",
          victimIsMissingPerson: "victims.isMissingPerson",
          victimIsNativePeople: "victims.isNativePeople",
          victimIsPregnant: "victims.isPregnant",
          victimHasDisabillity: "victims.hasDisabillity",
          victimOccupation: "victims.occupation",
          victimHasChildren: "victims.hasChildren",
          victimNumberOfChildren: "victims.numberOfChildren",
          victimAgeOfChildren: "victims.ageOfChildren",

          //Aggressor
          aggressorFullName: "aggressors.fullName",
          aggressorAge: "aggressors.age",
          aggressorGender: "aggressors.gender",
          aggressorHasLegalComplaintHistory: "aggressors.hasLegalComplaintHistory",
          aggressorHasPreviousCases: "aggressors.hasPreviousCases",
          aggressorWasInPrison: "aggressors.wasInPrison",
          aggressorBehaviourPostCase: "aggressors.behaviourPostCase",
          aggressorSecurityForce: "aggressors.securityForce",

        });

      const errors = [];

      if (cases.length === 0) {
        errors.push({
          "type": "param",
          "path": "/{caseId}",
          "message": "Case id no existe",
        });
      }

      if (errors.length > 0) {
        ctx.status = 422;
        ctx.body = errors;
        return;
      }

      const firstCase = cases[0];

      const caseNested = {
        id: firstCase.id,
        caseCategory: firstCase.caseCategory,
        wasItAnAttempt: firstCase.wasItAnAttempt,
        isInsufficientDataOrUnderInvestigation: firstCase.isInsufficientDataOrUnderInvestigation,
        occurredAt: firstCase.occurredAt,
        momentOfDay: firstCase.momentOfDay,
        province: firstCase.province,
        location: firstCase.location,
        geographicLocation: firstCase.geographicLocation,
        place: firstCase.place,
        murderWeapon: firstCase.murderWeapon,
        hadLegalComplaints: firstCase.hadLegalComplaints,
        totalLegalComplaints: firstCase.totalLegalComplaints,
        wasJudicialized: firstCase.wasJudicialized,
        judicialMeasures: firstCase.judicialMeasures,
        victimBondAggressor: firstCase.victimBondAggressor,
        isRape: firstCase.isRape,
        isRelatedToOrganizedCrime: firstCase.isRelatedToOrganizedCrime,
        organizedCrimeNotes: firstCase.organizedCrimeNotes,
        generalNotes: firstCase.generalNotes,
        newsLinks: firstCase.newsLinks,

        victim: {
          fullName: firstCase.victimFullName,
          age: firstCase.victimAge,
          gender: firstCase.victimGender,
          isSexualWorker: firstCase.victimIsSexualWorker,
          isMissingPerson: firstCase.victimIsMissingPerson,
          isNativePeople: firstCase.victimIsNativePeople,
          isPregnant: firstCase.victimIsPregnant,
          hasDisabillity: firstCase.victimHasDisabillity,
          occupation: firstCase.victimOccupation,
          hasChildren: firstCase.victimHasChildren,
          numberOfChildren: firstCase.victimNumberOfChildren,
          ageOfChildren: firstCase.victimAgeOfChildren,

        },
        aggressor: {
          fullName: firstCase.aggressorFullName,
          age: firstCase.aggressorAge,
          gender: firstCase.aggressorGender,
          hasLegalComplaintHistory: firstCase.aggressorHasLegalComplaintHistory,
          hasPreviousCases: firstCase.aggressorHasPreviousCases,
          wasInPrison: firstCase.aggressorWasInPrison,
          behaviourPostCase: firstCase.aggressorBehaviourPostCase,
          securityForce: firstCase.aggressorSecurityForce,
        },
      };

      ctx.body = caseNested;
    },
  ],
});
export default router.nativeRouter;
