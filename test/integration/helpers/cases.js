import { INTERNAL_KEY } from "./auth.js";
import { api } from "./server.js";

// Minimal valid Case request body. Required by the schema: occurredAt, province,
// place, newsLinks, victim, aggressor, caseCategory. victim/aggressor sub-fields
// are all optional. Pass overrides to exercise specific fields.
export const caseBody = (overrides = {}) => ({
  occurredAt: "2025-06-15",
  province: "BUENOS_AIRES",
  place: "VIVIENDA_DE_LA_VICTIMA",
  caseCategory: "FEMICIDIO_DIRECTO",
  newsLinks: ["https://example.com/n1"],
  victim: { fullName: "Victima Uno" },
  aggressor: { fullName: "Agresor Uno" },
  ...overrides,
});

// Creates a case via the internal-key path. Convenience for list/get tests that
// need rows to exist; not the subject under test there.
export const createCase = (overrides) =>
  api("/v1/cases", {
    method: "POST",
    headers: { authorization: INTERNAL_KEY },
    body: caseBody(overrides),
  });
