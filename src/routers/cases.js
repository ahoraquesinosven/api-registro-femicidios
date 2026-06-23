import { OpenApiRouter } from "../openapi/index.js";
import { securitySchemes } from "../openapi/securitySchemes.js";
import knex from "../services/knex.js";
import { omit } from "../lib/fn.js"
import { encodeCursor, decodeCursor, CursorError } from "../lib/cursor.js"

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
    security: [securitySchemes.oauth, securitySchemes.internal],
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

const LIST_FIELDS = [
  "case.id",
  "case.caseCategory",
  "case.occurredAt",
  "case.province",
  "case.location",
  "case.murderWeapon",
  "case.victimBondAggressor",
  "case.wasItAnAttempt",
  "victim.fullName",
  "victim.age",
  "aggressor.fullName",
  "aggressor.age",
];

const buildBaseQuery = (query) =>
  knex("cases as case")
    .join("victims as victim", "case.victimId", "victim.id")
    .join("aggressors as aggressor", "case.aggressorId", "aggressor.id")
    .where((builder) => {
      if (query.fromDate) builder.where("case.occurredAt", ">=", query.fromDate);
      if (query.toDate) builder.where("case.occurredAt", "<", query.toDate);
      if (query.province) builder.where("case.province", query.province);
      if (query.location) builder.whereUnaccentedMatch("case.location", query.location);
      if (query.caseCategory) builder.where("case.caseCategory", query.caseCategory);
      if (query.victimFullName) builder.whereNameMatch("victim.fullName", query.victimFullName);
      if (query.murderWeapon) builder.where("case.murderWeapon", query.murderWeapon);
      if (query.aggressorFullName) builder.whereNameMatch("aggressor.fullName", query.aggressorFullName);
      if (query.victimBondAggressor) builder.where("case.victimBondAggressor", query.victimBondAggressor);
      if (query.wasItAnAttempt) builder.where("case.wasItAnAttempt", query.wasItAnAttempt);
    });

const CASE_ITEM_SCHEMA = {
  type: "object",
  required: ["id", "occurredAt", "province", "victim", "aggressor", "caseCategory"],
  properties: {
    id: { type: "integer" },
    caseCategory: { $ref: "#/components/schemas/Case/properties/caseCategory" },
    occurredAt: { $ref: "#/components/schemas/Case/properties/occurredAt" },
    province: { $ref: "#/components/schemas/Case/properties/province" },
    location: { $ref: "#/components/schemas/Case/properties/location" },
    murderWeapon: { $ref: "#/components/schemas/Case/properties/location" },
    victimBondAggressor: { $ref: "#/components/schemas/CaseMurderWeapon" },
    wasItAnAttempt: { type: "boolean" },
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
};

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
      {
        name: "wasItAnAttempt",
        in: "query",
        schema: { type: "boolean" },
      },
      {
        name: "limit",
        in: "query",
        schema: { type: "integer", minimum: 0, maximum: 200, default: 50 },
      },
      {
        name: "start",
        in: "query",
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "Paginated list of cases",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["limit", "total", "start", "next", "page"],
              properties: {
                limit: { type: "integer" },
                total: { type: "integer" },
                start: { type: ["string", "null"] },
                next: { type: ["string", "null"] },
                page: { type: "array", items: CASE_ITEM_SCHEMA },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid cursor",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { message: { type: "string" } },
            },
          },
        },
      },
    },
  },
  handlers: [
    async (ctx) => {
      const limit = ctx.query.limit !== undefined ? Number(ctx.query.limit) : 50;

      let cursorData = null;
      if (ctx.query.start) {
        try {
          cursorData = decodeCursor(ctx.query.start);
        } catch (e) {
          if (e instanceof CursorError) {
            ctx.status = 400;
            ctx.body = { message: "Invalid cursor" };
            return;
          }
          throw e;
        }
      }

      let dataQuery = buildBaseQuery(ctx.query);
      if (cursorData) {
        dataQuery = dataQuery.where((b) => {
          b.where("case.occurredAt", "<", cursorData.occurredAt)
            .orWhere((b2) => {
              b2.where("case.occurredAt", cursorData.occurredAt)
                .where("case.id", "<", cursorData.id);
            });
        });
      }
      dataQuery = dataQuery
        .orderBy("case.occurredAt", "desc")
        .orderBy("case.id", "desc")
        .limit(limit);

      const [page, [{ count }]] = await Promise.all([
        dataQuery.toNestedObjects({ rootQualifier: "case", fields: LIST_FIELDS }),
        buildBaseQuery(ctx.query).count("case.id as count"),
      ]);

      const total = Number(count);
      const next = (page.length === limit && limit > 0)
        ? encodeCursor(page[page.length - 1].occurredAt, page[page.length - 1].id)
        : null;

      ctx.body = { limit, total, start: ctx.query.start ?? null, next, page };
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

      //En el edit: se setea default todo en null, si el campo viene, lo sobrescribe.
      // Pero si el campo no se edita y no tiene valor actual (porque desde la UI no se manda el campo), se deja en null para asegurar de tener la BD actualizada.

      const defaultVictim = {
        fullName: null,
        age: null,
        gender: null,
        nationality: null,
        isSexualWorker: null,
        isMissingPerson: null,
        isNativePeople: null,
        isPregnant: null,
        hasDisabillity: null,
        occupation: null,
        hasChildren: null,
        numberOfChildren: null,
        ageOfChildren: null
      }

      const defaultAggressor = {
        fullName: null,
        age: null,
        gender: null,
        hasLegalComplaintHistory: null,
        hasPreviousCases: null,
        wasInPrison: null,
        behaviourPostCase: null,
        belongsSecurityForce: null,
        securityForce: null,
      }

      const defaultCase = {
        organizedCrimeNotes: null,
        wasItAnAttempt: null,
        isInsufficientDataOrUnderInvestigation: null,
        momentOfDay: null,
        location: null,
        geographicLocation: null,
        murderWeapon: null,
        hadLegalComplaints: null,
        totalLegalComplaints: null,
        wasJudicialized: null,
        judicialMeasures: null,
        victimBondAggressor: null,
        isRape: null,
        isRelatedToOrganizedCrime: null,
        organizedCrimeNotes: null,
        generalNotes: null,
        hasMediaGenderPerspective: null,
        coverageMediaPerspectiveNotes: null,
      }


      await knex.transaction(async (trx) => {
        await trx("victims")
          .where('id', ids[0].victimId)
          .update(
            {
              ...defaultVictim,
              ...body.victim
            }
          );

        await trx("aggressors")
          .where('id', ids[0].aggressorId)
          .update(
            {
              ...defaultAggressor,
              ...body.aggressor
            }
          );

        await trx("cases")
          .where('id', ctx.params.caseId)
          .update({
            ...omit(
              {
                ...defaultCase,
                ...body

              }, [
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

      const cases = await baseQuery.toNestedObjects({
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
