import { OpenApiRouter } from "../openapi.js";
import { requireServerAuth } from "../middleware/auth.js";
import knex from "knex";

const router = new OpenApiRouter({
  prefix: "/v1/case",
});

router.operation({
  relativePath: "/",
  method: "post",
  spec: {
    tags: ["cases"],
    summary: "Insert a case, victim, and aggresor into DB",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              victim: {
                type: "object",
                properties: {
                  victim_name_lastname: { type: "string" },
                  victim_age: { type: "integer" },
                  victim_nationality: { type: "string", maxLength: 3 },
                  victim_prostitution: { type: "boolean" },
                  victim_missing: { type: "boolean" },
                  victim_native_people: { type: "boolean" },
                  victim_pregnant: { type: "boolean" },
                  victim_disabillity: { type: "boolean" },
                  victim_ocupation: { type: "string" },
                  victim_children: { type: "boolean" },
                },
                required: ["victim_name_lastname"],
              },
              aggresor: {
                type: "object",
                properties: {
                  aggresor_name_lastname: { type: "string" },
                  aggresor_gender: { type: "string" },
                  aggresor_age: { type: "integer" },
                  aggresor_legal_complaint_history: { type: "boolean" },
                  aggresor_cases_history: { type: "boolean" },
                  aggresor_captive_history: { type: "boolean" },
                  aggresor_behaviour_post_case: { type: "boolean" },
                },
                required: ["aggresor_name_lastname"],
              },
              case: {
                type: "object",
                properties: {
                  incident_date: { type: "string", format: "date" },
                  case_day_moment: { type: "string" },
                  case_type: { type: "string" },
                  case_gender: { type: "string" },
                  case_province: { type: "string" },
                  case_location: { type: "string" },
                  case_geographic_ubication: { type: "string" },
                  case_place: { type: "string" },
                  case_form: { type: "string" },
                  case_justice: { type: "boolean" },
                  case_legal_complaints: { type: "integer" },
                  case_rape: { type: "boolean" },
                  case_organized_crime: { type: "boolean" },
                  case_organized_crime_notes: { type: "string" },
                  case_notes: { type: "string" },
                  case_news_links: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["incident_date", "case_type"],
              },
            },
            required: ["victim", "aggresor", "case"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "Data inserted successfully",
      },
      400: {
        description: "Bad request",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  },
  handlers: [
    requireServerAuth,
    async (ctx) => {
      const { victim, aggresor, case: caseData } = ctx.request.body;

      try {
        await knex.transaction(async (trx) => {
          const victimId = await trx("victims")
            .insert({
              victim_name_lastname: victim.victim_name_lastname,
              victim_age: victim.victim_age,
              victim_nationality: victim.victim_nationality,
              victim_prostitution: victim.victim_prostitution,
              victim_missing: victim.victim_missing,
              victim_native_people: victim.victim_native_people,
              victim_pregnant: victim.victim_pregnant,
              victim_disabillity: victim.victim_disabillity,
              victim_ocupation: victim.victim_ocupation,
              victim_children: victim.victim_children,
              victim_creation: trx.fn.now(),
              victim_last_update: trx.fn.now(),
            })
            .returning("victim_id");

          const aggresorId = await trx("aggresors")
            .insert({
              aggresor_name_lastname: aggresor.aggresor_name_lastname,
              aggresor_gender: aggresor.aggresor_gender,
              aggresor_age: aggresor.aggresor_age,
              aggresor_legal_complaint_history: aggresor.aggresor_legal_complaint_history,
              aggresor_cases_history: aggresor.aggresor_cases_history,
              aggresor_captive_history: aggresor.aggresor_captive_history,
              aggresor_behaviour_post_case: aggresor.aggresor_behaviour_post_case,
              aggresor_creation: trx.fn.now(),
              aggresor_last_update: trx.fn.now(),
            })
            .returning("aggresor_id");

          await trx("cases").insert({
            victim_id: victimId,
            aggresor_id: aggresorId,
            incident_date: caseData.incident_date,
            case_day_moment: caseData.case_day_moment,
            case_type: caseData.case_type,
            case_gender: caseData.case_gender,
            case_province: caseData.case_province,
            case_location: caseData.case_location,
            case_geographic_ubication: caseData.case_geographic_ubication,
            case_place: caseData.case_place,
            case_form: caseData.case_form,
            case_justice: caseData.case_justice,
            case_legal_complaints: caseData.case_legal_complaints,
            case_rape: caseData.case_rape,
            case_organized_crime: caseData.case_organized_crime,
            case_organized_crime_notes: caseData.case_organized_crime_notes,
            case_notes: caseData.case_notes,
            case_news_links: caseData.case_news_links,
            case_creation: trx.fn.now(),
            last_update: trx.fn.now(),
          });

          await trx.commit();
        });

        ctx.status = 201;
        ctx.body = { message: "Data inserted successfully" };

      } catch (error) {
        ctx.status = 500;
        ctx.body = { message: "Error", error: error.message };
      }
    },
  ],
});

router.operation({
  relativePath: "/{case_id}",
  method: "get",
  spec: {
    tags: ["cases"],
    summary: "Get case by ID",
    parameters: [
      {
        name: "case_id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        description: "The case's ID",
      },
    ],
    responses: {
      200: {
        description: "Case retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                case: {
                  type: "object",
                  properties: {
                    case_id: { type: "integer" },
                    incident_date: { type: "string", format: "date" },
                    case_day_moment: { type: "string" },
                    case_type: { type: "string" },
                    case_gender: { type: "string" },
                    case_province: { type: "string" },
                    case_location: { type: "string" },
                    case_geographic_ubication: { type: "string" },
                    case_place: { type: "string" },
                    case_form: { type: "string" },
                    case_justice: { type: "boolean" },
                    case_legal_complaints: { type: "integer" },
                    case_rape: { type: "boolean" },
                    case_organized_crime: { type: "boolean" },
                    case_organized_crime_notes: { type: "string" },
                    case_notes: { type: "string" },
                    case_news_links: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
                victim: {
                  type: "object",
                  properties: {
                    victim_name_lastname: { type: "string" },
                    victim_age: { type: "integer" },
                    victim_nationality: { type: "string" },
                    victim_prostitution: { type: "boolean" },
                    victim_missing: { type: "boolean" },
                    victim_native_people: { type: "boolean" },
                    victim_pregnant: { type: "boolean" },
                    victim_disabillity: { type: "boolean" },
                    victim_ocupation: { type: "string" },
                    victim_children: { type: "boolean" },
                  },
                },
                aggresor: {
                  type: "object",
                  properties: {
                    aggresor_name_lastname: { type: "string" },
                    aggresor_gender: { type: "string" },
                    aggresor_age: { type: "integer" },
                    aggresor_legal_complaint_history: { type: "boolean" },
                    aggresor_cases_history: { type: "boolean" },
                    aggresor_captive_history: { type: "boolean" },
                    aggresor_behaviour_post_case: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
      404: {
        description: "Not found",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  },
  handlers: [
    requireServerAuth,
    async (ctx) => {
      const { case_id } = ctx.params;

      try {
        const caseData = await knex("cases")
          .where("case_id", case_id);

        if (!caseData) {
          ctx.status = 404;
          ctx.body = { message: "Case not found" };
          return;
        }

        const victimData = await knex("victims")
          .where("victim_id", caseData.victim_id);

        const aggresorData = await knex("aggresors")
          .where("aggresor_id", caseData.aggresor_id);

        ctx.status = 200;

        ctx.body = {
          case: caseData,
          victim: victimData,
          aggresor: aggresorData,
        };

      } catch (error) {
        ctx.status = 500;
        ctx.body = { message: "Internal Server Error", error: error.message };
      }
    },
  ],
});


export default router;
