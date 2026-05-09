import { OpenApiRouter } from "../openapi/index.js";
import { securitySchemes } from "../openapi/securitySchemes.js";
import knex, { NestedObjectsQuery } from "../services/knex.js";
import { omit } from "../lib/fn.js"

const router = new OpenApiRouter({
  prefix: "/v1/cases",
});

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

  if ((body.hasMediaGenderPerspective === true | body.hasMediaGenderPerspective === false) && !body.coverageMediaPerspectiveNotes) {
    errors.push({
      "type": "body",
      "path": "/coverageMediaPerspectiveNotes",
      "message": "Debe completarse las notas de cobertura mediática si se indicó si el caso tuvo o no tuvo perspectiva de género en los medios",
    });
  }

  if (body.coverageMediaPerspectiveNotes && (body.hasMediaGenderPerspective === null || body.hasMediaGenderPerspective === undefined)) {
    errors.push({
      "type": "body",
      "path": "/hasMediaGenderPerspective",
      "message": "Debe indicarse si el caso tuvo o no perspectiva de género en los medios si se completaron las notas de cobertura mediática",
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
          ...omit(body, [
            "victim",
            "aggressor",
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
      const baseQuery = knex("cases as case")
        .join("victims as victim", "case.victimId", "victim.id")
        .join("aggressors as aggressor", "case.aggressorId", "aggressor.id")
        .where((builder) => {
          if (ctx.query.fromDate) {
            builder.where("case.occurredAt", ">=", ctx.query.fromDate);
          }
          if (ctx.query.toDate) {
            builder.where("case.occurredAt", "<", ctx.query.toDate);
          }
          if (ctx.query.province) {
            builder.where("case.province", ctx.query.province);
          }
          if (ctx.query.location) {
            builder.whereRaw('unaccent("case"."location") ILIKE unaccent(?)', `%${ctx.query.location}%`)
          }
          if (ctx.query.caseCategory) {
            builder.where("case.caseCategory", ctx.query.caseCategory);
          }
          if (ctx.query.victimFullName) {
            builder.whereRaw('unaccent("victim"."fullName") ILIKE unaccent(?)', `%${ctx.query.victimFullName}%`)
          }
          if (ctx.query.murderWeapon) {
            builder.where("case.murderWeapon", ctx.query.murderWeapon);
          }
          if (ctx.query.aggressorFullName) {
            builder.whereRaw('unaccent("aggressor"."fullName") ILIKE unaccent(?)', `%${ctx.query.aggressorFullName}%`)
          }
          if (ctx.query.victimBondAggressor) {
            builder.where("case.victimBondAggressor", ctx.query.victimBondAggressor);
          }
        })
        .orderBy("case.occurredAt", "asc");

      const objectsQuery = new NestedObjectsQuery({
        baseQuery: baseQuery,
        rootQualifier: "case",
        fields: [
          "case.id",
          "case.caseCategory",
          "case.occurredAt",
          "case.province",
          "case.location",
          "case.murderWeapon",
          "case.victimBondAggressor",
          "victim.fullName",
          "victim.age",
          "aggressor.fullName",
          "aggressor.age"
        ],
      });

      ctx.body = await objectsQuery.select();
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
      204: {
        description: "Case updated successfully",
      },
      422: { $ref: "#/components/responses/ValidationErrorResponse" },
      404: { $ref: "#/components/responses/ValidationErrorNotFound" },
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

      if (ids.length !== 1) {
        ctx.status = 404;
        ctx.body = [{
          "type": "path",
          "path": "/caseId",
          "message": `El caso ${ctx.params.caseId} no existe`,
        }];
        return;
      }

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
            ...omit(body, [
              "victim",
              "aggressor",
            ]),
          });
      });

      ctx.status = 204;
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
      404: { $ref: "#/components/responses/ValidationErrorNotFound" },
    },
  },
  handlers: [
    async (ctx) => {
      const baseQuery = knex("cases as case")
        .join("victims as victim", "case.victimId", "victim.id")
        .join("aggressors as aggressor", "case.aggressorId", "aggressor.id")
        .where('case.id', ctx.params.caseId);

      const objectsQuery = new NestedObjectsQuery({
        baseQuery: baseQuery,
        rootQualifier: "case",
        fields: [
          // Base case fields
          "case.id",
          "case.caseCategory",
          "case.wasItAnAttempt",
          "case.isInsufficientDataOrUnderInvestigation",
          "case.occurredAt",
          "case.momentOfDay",
          "case.province",
          "case.location",
          "case.geographicLocation",
          "case.place",
          "case.murderWeapon",
          "case.hadLegalComplaints",
          "case.totalLegalComplaints",
          "case.wasJudicialized",
          "case.judicialMeasures",
          "case.victimBondAggressor",
          "case.isRape",
          "case.isRelatedToOrganizedCrime",
          "case.organizedCrimeNotes",
          "case.generalNotes",
          "case.newsLinks",
          "case.hasMediaGenderPerspective",
          "case.coverageMediaPerspectiveNotes",
          // Victim
          "victim.fullName",
          "victim.age",
          "victim.gender",
          "victim.isSexualWorker",
          "victim.isMissingPerson",
          "victim.isNativePeople",
          "victim.isPregnant",
          "victim.hasDisabillity",
          "victim.occupation",
          "victim.hasChildren",
          "victim.numberOfChildren",
          "victim.ageOfChildren",
          // Aggressor
          "aggressor.fullName",
          "aggressor.age",
          "aggressor.gender",
          "aggressor.hasLegalComplaintHistory",
          "aggressor.hasPreviousCases",
          "aggressor.wasInPrison",
          "aggressor.behaviourPostCase",
          "aggressor.securityForce",
        ],
      });

      const cases = await objectsQuery.select();

      if (cases.length === 0) {
        ctx.status = 404;
        ctx.body = [{
          "type": "path",
          "path": "/caseId",
          "message": `El caso ${ctx.params.caseId} no existe`,
        }];
        return;
      }

      ctx.body = cases[0];
    },
  ],
});
export default router.nativeRouter;
