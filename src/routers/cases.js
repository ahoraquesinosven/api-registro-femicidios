import { omit, omitNullValues } from "../lib/fn.js";
import { keysetPaginator } from "../lib/keysetPagination.js";
import { OpenApiRouter } from "../openapi/index.js";
import { securitySchemes } from "../openapi/securitySchemes.js";
import knex from "../services/knex.js";

const router = new OpenApiRouter({
  prefix: "/v1/cases",
});

const casesPaginator = keysetPaginator([
  {
    name: "occurredAt",
    column: "case.occurredAt",
    direction: "desc",
    type: "date",
  },
  { name: "id", column: "case.id", direction: "desc", type: "id" },
]);

const toDateString = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

const caseValidations = (body) => {
  const errors = [];

  if (body.organizedCrimeNotes && !body.isRelatedToOrganizedCrime) {
    errors.push({
      type: "body",
      path: "/isRelatedToOrganizedCrime",
      message: "Debe ser verdadero si hay notas de crimen organizado",
    });
  }

  if (!body.organizedCrimeNotes && body.isRelatedToOrganizedCrime) {
    errors.push({
      type: "body",
      path: "/organizedCrimeNotes",
      message:
        "Debe completarse notas adicionales si es un caso relacionado con el crimen organizado",
    });
  }

  if (
    body.victim.ageOfChildren &&
    body.victim.numberOfChildren < body.victim.ageOfChildren.length
  ) {
    errors.push({
      type: "body",
      path: "/victim.numberOfChildren",
      message:
        "La cantidad de hijxs no puede ser menor a la cantidad de edades proporcionadas",
    });
  }

  if (body.totalLegalComplaints && !body.hadLegalComplaints) {
    errors.push({
      type: "body",
      path: "/hadLegalComplaints",
      message: "Debe ser verdadero is se completo la cantidad de denuncias",
    });
  }

  if (body.wasJudicialized && !body.hadLegalComplaints) {
    errors.push({
      type: "body",
      path: "/hadLegalComplaints",
      message: "Debe ser verdadero si tiene medidas judiciales",
    });
  }

  if (body.judicialMeasures && !body.wasJudicialized) {
    errors.push({
      type: "body",
      path: "/wasJudicialized",
      message:
        "Debe ser verdadero si tiene al menos una medidas judicial seleccionada",
    });
  }

  if (
    (body.hasMediaGenderPerspective === true) |
      (body.hasMediaGenderPerspective === false) &&
    !body.coverageMediaPerspectiveNotes
  ) {
    errors.push({
      type: "body",
      path: "/coverageMediaPerspectiveNotes",
      message:
        "Debe completarse las notas de cobertura mediática si se indicó si el caso tuvo o no tuvo perspectiva de género en los medios",
    });
  }

  if (
    body.coverageMediaPerspectiveNotes &&
    (body.hasMediaGenderPerspective === null ||
      body.hasMediaGenderPerspective === undefined)
  ) {
    errors.push({
      type: "body",
      path: "/hasMediaGenderPerspective",
      message:
        "Debe indicarse si el caso tuvo o no perspectiva de género en los medios si se completaron las notas de cobertura mediática",
    });
  }

  //victim validations
  if (body.victim.numberOfChildren && !body.victim.hasChildren) {
    errors.push({
      type: "body",
      path: "/victim.hasChildren",
      message: "Debe ser verdadero si tiene al menos un hijx",
    });
  }

  if (
    body.victim.ageOfChildren &&
    !body.victim.numberOfChildren &&
    !body.victim.hasChildren
  ) {
    errors.push({
      type: "body",
      path: "/victim.hasChildren",
      message:
        "Debe ser verdadero si se cargo al menos una edad de al menos un hijx",
    });
  }

  //aggresor validations
  if (body.aggressor.securityForce && !body.aggressor.belongsSecurityForce) {
    errors.push({
      type: "body",
      path: "/aggressor.belongsSecurityForce",
      message:
        "Debe ser verdadero si se selecciona al menos una fuerza de seguridad",
    });
  }

  return errors;
};

router.operation({
  method: "post",
  relativePath: "/",
  spec: {
    tags: ["cases"],
    operationId: "createCase",
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
      401: { $ref: "#/components/responses/UnauthorizedResponse" },
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
          ...omit(body, ["victim", "aggressor"]),
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
    operationId: "listCases",
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
            schema: { $ref: "#/components/schemas/CaseListPage" },
          },
        },
      },
      400: { $ref: "#/components/responses/InvalidCursorResponse" },
      401: { $ref: "#/components/responses/UnauthorizedResponse" },
    },
  },
  handlers: [
    async (ctx) => {
      const limit =
        ctx.query.limit !== undefined ? Number(ctx.query.limit) : 50;

      const baseQuery = knex("cases as case")
        .join("victims as victim", "case.victimId", "victim.id")
        .join("aggressors as aggressor", "case.aggressorId", "aggressor.id")
        .where((builder) => {
          if (ctx.query.fromDate)
            builder.where("case.occurredAt", ">=", ctx.query.fromDate);
          if (ctx.query.toDate)
            builder.where("case.occurredAt", "<", ctx.query.toDate);
          if (ctx.query.province)
            builder.where("case.province", ctx.query.province);
          if (ctx.query.location)
            builder.whereUnaccentedMatch("case.location", ctx.query.location);
          if (ctx.query.caseCategory)
            builder.where("case.caseCategory", ctx.query.caseCategory);
          if (ctx.query.victimFullName)
            builder.whereNameMatch("victim.fullName", ctx.query.victimFullName);
          if (ctx.query.murderWeapon)
            builder.where("case.murderWeapon", ctx.query.murderWeapon);
          if (ctx.query.aggressorFullName)
            builder.whereNameMatch(
              "aggressor.fullName",
              ctx.query.aggressorFullName,
            );
          if (ctx.query.victimBondAggressor)
            builder.where(
              "case.victimBondAggressor",
              ctx.query.victimBondAggressor,
            );
          if (ctx.query.wasItAnAttempt)
            builder.where("case.wasItAnAttempt", ctx.query.wasItAnAttempt);
        });

      // Count the full filtered set. Knex builders are mutable and
      // applyCursor/applyOrder/limit all return the same instance, so the
      // count needs its own clone taken before those mutate baseQuery —
      // otherwise count(case.id) lands on the page query (no GROUP BY).
      const countQuery = baseQuery.clone().count("case.id as count");

      const cursorData = casesPaginator.decode(ctx.query.start);
      const pageQuery = casesPaginator
        .applyOrder(casesPaginator.applyCursor(baseQuery, cursorData))
        .limit(limit);

      const [page, [{ count }]] = await Promise.all([
        pageQuery.toNestedObjects({
          rootQualifier: "case",
          fields: [
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
          ],
        }),
        countQuery,
      ]);

      const total = Number(count);
      const next =
        page.length === limit && limit > 0
          ? casesPaginator.encode(page[page.length - 1])
          : null;

      ctx.body = {
        limit,
        total,
        start: ctx.query.start ?? null,
        next,
        // Optional fields are non-nullable in the Case schema, so drop the
        // null-valued keys the DB returns for unset fields rather than
        // emitting them and breaking spec conformance.
        page: page.map((item) =>
          omitNullValues({
            ...item,
            occurredAt: toDateString(item.occurredAt),
            victim: omitNullValues(item.victim),
            aggressor: omitNullValues(item.aggressor),
          }),
        ),
      };
    },
  ],
});

router.operation({
  method: "put",
  relativePath: "/{caseId}",
  spec: {
    tags: ["cases"],
    operationId: "updateCase",
    summary: "Update a case",
    security: [securitySchemes.oauth],
    parameters: [
      {
        in: "path",
        name: "caseId",
        required: true,
        description: "ID of the case",
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
    ],

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
      401: { $ref: "#/components/responses/UnauthorizedResponse" },
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

      const ids = await knex("cases")
        .where("id", ctx.params.caseId)
        .select("victimId", "aggressorId");

      if (ids.length !== 1) {
        ctx.status = 404;
        ctx.body = [
          {
            type: "path",
            path: "/caseId",
            message: `El caso ${ctx.params.caseId} no existe`,
          },
        ];
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
        ageOfChildren: null,
      };

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
      };

      const defaultCase = {
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
      };

      await knex.transaction(async (trx) => {
        await trx("victims")
          .where("id", ids[0].victimId)
          .update({
            ...defaultVictim,
            ...body.victim,
          });

        await trx("aggressors")
          .where("id", ids[0].aggressorId)
          .update({
            ...defaultAggressor,
            ...body.aggressor,
          });

        await trx("cases")
          .where("id", ctx.params.caseId)
          .update({
            ...omit(
              {
                ...defaultCase,
                ...body,
              },
              ["victim", "aggressor"],
            ),
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
    operationId: "getCase",
    summary: "Get a case by id",
    security: [securitySchemes.oauth],
    parameters: [
      {
        in: "path",
        name: "caseId",
        required: true,
        description: "ID of the case",
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
    ],
    responses: {
      200: {
        description: "Case, victim and agreesor retrieved successfully",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Case" },
          },
        },
      },
      401: { $ref: "#/components/responses/UnauthorizedResponse" },
      404: { $ref: "#/components/responses/ValidationErrorNotFound" },
    },
  },
  handlers: [
    async (ctx) => {
      const baseQuery = knex("cases as case")
        .join("victims as victim", "case.victimId", "victim.id")
        .join("aggressors as aggressor", "case.aggressorId", "aggressor.id")
        .where("case.id", ctx.params.caseId);

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
        ctx.body = [
          {
            type: "path",
            path: "/caseId",
            message: `El caso ${ctx.params.caseId} no existe`,
          },
        ];
        return;
      }

      const c = cases[0];
      // Optional fields are non-nullable in the Case schema, so drop the
      // null-valued keys the DB returns for unset fields, mirroring the list
      // handler, rather than emitting them and breaking spec conformance.
      ctx.body = omitNullValues({
        ...c,
        occurredAt: toDateString(c.occurredAt),
        victim: omitNullValues(c.victim),
        aggressor: omitNullValues(c.aggressor),
      });
    },
  ],
});
export default router.nativeRouter;
