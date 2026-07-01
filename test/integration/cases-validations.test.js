import assert from "node:assert/strict";
import { test } from "node:test";
import { INTERNAL_KEY } from "./helpers/auth.js";
import { caseBody } from "./helpers/cases.js";
import { useTestHarness } from "./helpers/harness.js";
import { api } from "./helpers/server.js";

// POST /v1/cases cross-field validation matrix (caseValidations in
// src/routers/cases.js) plus JSON-schema-level failures. Bodies are crafted to
// be schema-valid except for the one cross-field rule under test, so the
// request reaches the handler and returns the custom 422 error array
// (each entry is {type, path, message}).
const _ctx = useTestHarness();

const post = (overrides) =>
  api("/v1/cases", {
    method: "POST",
    headers: { authorization: INTERNAL_KEY },
    body: caseBody(overrides),
  });

// Asserts the body is a 422 with an error pointing at `path`.
const assertRejectsWith = async (overrides, path) => {
  const res = await post(overrides);
  assert.equal(res.status, 422);
  const errors = await res.json();
  assert.ok(Array.isArray(errors), "expected an error array");
  assert.ok(
    errors.some((e) => e.path === path),
    `expected an error on ${path}, got ${JSON.stringify(errors)}`,
  );
};

test("organizedCrimeNotes without isRelatedToOrganizedCrime", () =>
  assertRejectsWith(
    { organizedCrimeNotes: "algo", isRelatedToOrganizedCrime: false },
    "/isRelatedToOrganizedCrime",
  ));

test("isRelatedToOrganizedCrime without notes", () =>
  assertRejectsWith(
    { isRelatedToOrganizedCrime: true },
    "/organizedCrimeNotes",
  ));

test("numberOfChildren lower than ageOfChildren length", () =>
  assertRejectsWith(
    {
      victim: {
        fullName: "V",
        hasChildren: true,
        numberOfChildren: 1,
        ageOfChildren: [5, 6],
      },
    },
    "/victim.numberOfChildren",
  ));

test("totalLegalComplaints without hadLegalComplaints", () =>
  assertRejectsWith(
    { totalLegalComplaints: 2, hadLegalComplaints: false },
    "/hadLegalComplaints",
  ));

test("wasJudicialized without hadLegalComplaints", () =>
  assertRejectsWith(
    { wasJudicialized: true, hadLegalComplaints: false },
    "/hadLegalComplaints",
  ));

test("judicialMeasures without wasJudicialized", () =>
  assertRejectsWith(
    {
      judicialMeasures: ["BOTON_ANTIPANICO"],
      wasJudicialized: false,
      hadLegalComplaints: false,
    },
    "/wasJudicialized",
  ));

test("hasMediaGenderPerspective without coverage notes", () =>
  assertRejectsWith(
    { hasMediaGenderPerspective: true },
    "/coverageMediaPerspectiveNotes",
  ));

test("coverage notes without hasMediaGenderPerspective", () =>
  assertRejectsWith(
    { coverageMediaPerspectiveNotes: "una nota" },
    "/hasMediaGenderPerspective",
  ));

test("victim.numberOfChildren without hasChildren", () =>
  assertRejectsWith(
    { victim: { fullName: "V", numberOfChildren: 2 } },
    "/victim.hasChildren",
  ));

test("victim.ageOfChildren without hasChildren", () =>
  assertRejectsWith(
    { victim: { fullName: "V", ageOfChildren: [5] } },
    "/victim.hasChildren",
  ));

test("aggressor.securityForce without belongsSecurityForce", () =>
  assertRejectsWith(
    {
      aggressor: {
        fullName: "A",
        securityForce: "POLICIA",
        belongsSecurityForce: false,
      },
    },
    "/aggressor.belongsSecurityForce",
  ));

test("missing required field is rejected by the schema", async () => {
  const body = caseBody();
  delete body.occurredAt;
  const res = await api("/v1/cases", {
    method: "POST",
    headers: { authorization: INTERNAL_KEY },
    body,
  });
  assert.equal(res.status, 422);
});

test("invalid enum value is rejected by the schema", async () => {
  const res = await post({ province: "NOWHERE" });
  assert.equal(res.status, 422);
});

test("a consistent media-perspective combo is accepted", async () => {
  const res = await post({
    hasMediaGenderPerspective: false,
    coverageMediaPerspectiveNotes: "Cobertura sin perspectiva de género",
  });
  assert.equal(res.status, 201);
});
