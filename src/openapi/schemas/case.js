

export default {
    type: "object",
    required: ["occurredAt", "province", "place", "newsLinks", "victim", "aggressor", "caseCategory"],
    dependentRequired: {
        organizedCrimeNotes: ["isRelatedToOrganizedCrime"],
        totalLegalComplaints: ["hadLegalComplaints"],
        wasJudicialized: ["hadLegalComplaints"],
        judicialMeasures: ["wasJudicialized"],
    },

    properties: {
        caseCategory: { $ref: "#/components/schemas/CaseCategory" },
        wasItAnAttempt: { type: "boolean" },
        isInsufficientDataOrUnderInvestigation: { type: "boolean" },
        occurredAt: { type: "string", format: "date" },
        momentOfDay: { $ref: "#/components/schemas/CaseMomentOfDay" },
        province: { $ref: "#/components/schemas/Province" },
        location: { type: "string" },
        geographicLocation: { $ref: "#/components/schemas/CaseGeographicLocation" },
        place: { $ref: "#/components/schemas/CasePlace" },
        murderWeapon: { $ref: "#/components/schemas/CaseMurderWeapon" },
        hadLegalComplaints: { type: "boolean" },
        totalLegalComplaints: { type: "integer" },
        wasJudicialized: { type: "boolean" }, //¿Había alguna medida judicial?
        judicialMeasures: { type: "array", items: { $ref: "#/components/schemas/CaseJudicialMeasure" } },
        victimBondAggressor: { $ref: "#/components/schemas/CaseVictimBondAggressor" },
        isRape: { type: "boolean" },
        isRelatedToOrganizedCrime: { type: "boolean" },
        organizedCrimeNotes: { type: "string" },
        generalNotes: { type: "string" },
        newsLinks: { type: "array", items: { type: "string" }, minItems: 1, "uniqueItems": true },



        victim: {
            type: "object",
            properties: {
                fullName: { type: "string", minLength: 5 },
                age: { type: "integer" },
                gender: { $ref: "#/components/schemas/Gender" },
                nationality: { $ref: "#/components/schemas/Nationality" },
                isSexualWorker: { type: "boolean" },
                isMissingPerson: { type: "boolean" },
                isNativePeople: { type: "boolean" },
                isPregnant: { type: "boolean" },
                hasDisabillity: { type: "boolean" },
                occupation: { type: "string" },
                hasChildren: { type: "boolean" },
                numberOfChildren: { type: "integer" },
                ageOfChildren: { type: "array", items: { type: "number" }, minItems: 0, "uniqueItems": false },
            },
            additionalProperties: false,
        },

        aggressor: {
            type: "object",
            dependentRequired: {
                securityForce: ["belongsSecurityForce"],
            },
            properties: {
                fullName: { type: "string", minLength: 5 },
                age: { type: "integer" },
                gender: { $ref: "#/components/schemas/Gender" },
                hasLegalComplaintHistory: { type: "boolean" },
                hasPreviousCases: { type: "boolean" },
                wasInPrison: { type: "boolean" },
                behaviourPostCase: { $ref: "#/components/schemas/CaseAggressorBehaviorPostCase" },
                belongsSecurityForce: { type: "boolean" },
                securityForce: { $ref: "#/components/schemas/CaseAggressorSecurityForce" },
            },
            additionalProperties: false,
        },
    },
    additionalProperties: false,
};