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

      // More complex validations
      const errors = [];

      //Case validations
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

export default router.nativeRouter;
