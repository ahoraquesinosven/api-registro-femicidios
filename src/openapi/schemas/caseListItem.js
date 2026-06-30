export default {
  type: "object",
  required: ["id", "occurredAt", "province", "victim", "aggressor", "caseCategory"],
  properties: {
    id: { type: "integer" },
    caseCategory: { $ref: "#/components/schemas/Case/properties/caseCategory" },
    occurredAt: { $ref: "#/components/schemas/Case/properties/occurredAt" },
    province: { $ref: "#/components/schemas/Case/properties/province" },
    location: { $ref: "#/components/schemas/Case/properties/location" },
    murderWeapon: { $ref: "#/components/schemas/Case/properties/murderWeapon" },
    victimBondAggressor: { $ref: "#/components/schemas/Case/properties/victimBondAggressor" },
    wasItAnAttempt: { $ref: "#/components/schemas/Case/properties/wasItAnAttempt" },
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
