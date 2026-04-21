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

router.operation({
  method: "put",
  relativePath: "/{case_id}",
  spec: {
    tags: ["cases"],
    summary: "Update a case",
    security: [securitySchemes.oauth],
    parameters: [{
      in: "path",
      name: "case_id",
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

      const ids = await knex('cases').where('id', ctx.params.case_id).select("victimId", "aggressorId");

      await knex.transaction(async (trx) => {
        await trx("victims")
          .where('id', ids[0].victimId)
          .update(body.victim);

        await trx("aggressors")
          .where('id', ids[0].aggressorId)
          .update(body.aggressor);

        await trx("cases")
          .where('id', ctx.params.case_id)
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

export default router.nativeRouter;
