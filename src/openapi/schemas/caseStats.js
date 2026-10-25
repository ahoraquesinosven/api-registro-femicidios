// Response of GET /v1/cases/stats. Every count is over the filtered set.

const countsBy = (properties) => ({
  type: "array",
  items: {
    type: "object",
    required: [...Object.keys(properties), "count"],
    properties: { ...properties, count: { type: "integer" } },
  },
});

// Optional case fields group their unset rows under null.
const nullable = (ref) => ({ oneOf: [{ $ref: ref }, { type: "null" }] });

// Counts of a nullable boolean field: true / false / unset.
const booleanBreakdown = {
  type: "object",
  required: ["yes", "no", "unknown"],
  properties: {
    yes: { type: "integer" },
    no: { type: "integer" },
    unknown: { type: "integer" },
  },
};

export default {
  type: "object",
  required: [
    "total",
    "byCategoryAndAttempt",
    "byProvince",
    "byMurderWeapon",
    "byVictimBondAggressor",
    "victimIsPregnant",
    "aggressorBelongsSecurityForce",
    "bySecurityForce",
  ],
  properties: {
    total: { type: "integer" },
    byCategoryAndAttempt: countsBy({
      caseCategory: { $ref: "#/components/schemas/CaseCategory" },
      wasItAnAttempt: { type: "boolean" },
    }),
    byProvince: countsBy({
      province: { $ref: "#/components/schemas/Province" },
    }),
    byMurderWeapon: countsBy({
      murderWeapon: nullable("#/components/schemas/CaseMurderWeapon"),
    }),
    byVictimBondAggressor: countsBy({
      victimBondAggressor: nullable(
        "#/components/schemas/CaseVictimBondAggressor",
      ),
    }),
    victimIsPregnant: booleanBreakdown,
    aggressorBelongsSecurityForce: booleanBreakdown,
    // Only aggressors with belongsSecurityForce = true; sums to
    // aggressorBelongsSecurityForce.yes.
    bySecurityForce: countsBy({
      securityForce: nullable(
        "#/components/schemas/CaseAggressorSecurityForce",
      ),
    }),
  },
};
