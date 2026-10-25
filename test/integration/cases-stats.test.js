import assert from "node:assert/strict";
import { test } from "node:test";
import { createCase } from "./helpers/cases.js";
import { useTestHarness } from "./helpers/harness.js";
import { assertConformsToSpec } from "./helpers/openapi.js";
import { api } from "./helpers/server.js";

// GET /v1/cases/stats (dashboard aggregates)
const ctx = useTestHarness();

const statsWith = async (params = {}) => {
  const res = await api(`/v1/cases/stats?${new URLSearchParams(params)}`, {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 200);
  return res.json();
};

const sumCounts = (rows) => rows.reduce((acc, row) => acc + row.count, 0);

test("returns 401 without auth", async () => {
  const res = await api("/v1/cases/stats");
  assert.equal(res.status, 401);
  assert.equal(res.headers.get("cache-control"), null);
});

test("lets the browser cache stats for 3 minutes", async () => {
  const res = await api("/v1/cases/stats", {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "private, max-age=180");
});

test("returns zeroed stats when there are no cases", async () => {
  const body = await statsWith();
  assert.equal(body.total, 0);
  assert.deepEqual(body.byProvince, []);
  assert.deepEqual(body.victimIsPregnant, { yes: 0, no: 0, unknown: 0 });
  assert.deepEqual(body.bySecurityForce, []);
});

test("stats conform to the OpenAPI spec", async () => {
  await createCase({ aggressor: { belongsSecurityForce: true } });
  await createCase({ murderWeapon: "ARMA_BLANCA" });

  const res = await api("/v1/cases/stats", {
    headers: { authorization: ctx.bearer },
  });
  assertConformsToSpec("get", "/v1/cases/stats", 200, await res.json());
});

test("groups by category and attempt", async () => {
  await createCase({
    caseCategory: "FEMICIDIO_DIRECTO",
    wasItAnAttempt: false,
  });
  await createCase({
    caseCategory: "FEMICIDIO_DIRECTO",
    wasItAnAttempt: false,
  });
  await createCase({ caseCategory: "FEMICIDIO_DIRECTO", wasItAnAttempt: true });
  await createCase({
    caseCategory: "FEMICIDIO_VINCULADO",
    wasItAnAttempt: false,
  });

  const body = await statsWith();
  assert.equal(body.total, 4);
  assert.deepEqual(body.byCategoryAndAttempt, [
    { caseCategory: "FEMICIDIO_DIRECTO", wasItAnAttempt: false, count: 2 },
    { caseCategory: "FEMICIDIO_DIRECTO", wasItAnAttempt: true, count: 1 },
    { caseCategory: "FEMICIDIO_VINCULADO", wasItAnAttempt: false, count: 1 },
  ]);
});

test("groups by province, murder weapon and victim bond", async () => {
  await createCase({
    province: "CORDOBA",
    murderWeapon: "ARMA_BLANCA",
    victimBondAggressor: "PAREJA_ACTUAL",
  });
  await createCase({
    province: "CORDOBA",
    murderWeapon: "ARMA_BLANCA",
    victimBondAggressor: "EX_PAREJA",
  });
  await createCase({ province: "BUENOS_AIRES" });

  const body = await statsWith();
  assert.deepEqual(body.byProvince, [
    { province: "CORDOBA", count: 2 },
    { province: "BUENOS_AIRES", count: 1 },
  ]);
  assert.deepEqual(body.byMurderWeapon, [
    { murderWeapon: "ARMA_BLANCA", count: 2 },
    { murderWeapon: null, count: 1 },
  ]);
  assert.equal(sumCounts(body.byVictimBondAggressor), 3);
  assert.deepEqual(
    body.byVictimBondAggressor.find((row) => row.victimBondAggressor === null),
    { victimBondAggressor: null, count: 1 },
  );
});

test("breaks down victim pregnancy into yes / no / unknown", async () => {
  await createCase({ victim: { isPregnant: true } });
  await createCase({ victim: { isPregnant: false } });
  await createCase({ victim: { isPregnant: false } });
  await createCase();

  const body = await statsWith();
  assert.deepEqual(body.victimIsPregnant, { yes: 1, no: 2, unknown: 1 });
});

test("breaks down aggressor security force membership and force", async () => {
  await createCase({
    aggressor: { belongsSecurityForce: true, securityForce: "POLICIA" },
  });
  await createCase({
    aggressor: { belongsSecurityForce: true, securityForce: "POLICIA" },
  });
  await createCase({
    aggressor: { belongsSecurityForce: true, securityForce: "GENDARME" },
  });
  await createCase({ aggressor: { belongsSecurityForce: true } });
  await createCase({ aggressor: { belongsSecurityForce: false } });
  await createCase();

  const body = await statsWith();
  assert.deepEqual(body.aggressorBelongsSecurityForce, {
    yes: 4,
    no: 1,
    unknown: 1,
  });
  assert.deepEqual(body.bySecurityForce, [
    { securityForce: "POLICIA", count: 2 },
    { securityForce: "GENDARME", count: 1 },
    { securityForce: null, count: 1 },
  ]);
  assert.equal(
    sumCounts(body.bySecurityForce),
    body.aggressorBelongsSecurityForce.yes,
  );
});

test("filters apply to every aggregate", async () => {
  await createCase({
    province: "CORDOBA",
    victim: { isPregnant: true },
    aggressor: { belongsSecurityForce: true, securityForce: "POLICIA" },
  });
  await createCase({
    province: "BUENOS_AIRES",
    victim: { isPregnant: true },
    aggressor: { belongsSecurityForce: true, securityForce: "GENDARME" },
  });

  const body = await statsWith({ province: "CORDOBA" });
  assert.equal(body.total, 1);
  assert.deepEqual(body.byProvince, [{ province: "CORDOBA", count: 1 }]);
  assert.deepEqual(body.victimIsPregnant, { yes: 1, no: 0, unknown: 0 });
  assert.deepEqual(body.bySecurityForce, [
    { securityForce: "POLICIA", count: 1 },
  ]);
});

test("filters by each case field", async () => {
  await createCase({
    caseCategory: "FEMICIDIO_VINCULADO",
    wasItAnAttempt: true,
    location: "Córdoba",
    murderWeapon: "ARMA_DE_FUEGO",
    victimBondAggressor: "EX_PAREJA",
  });
  await createCase();

  for (const params of [
    { caseCategory: "FEMICIDIO_VINCULADO" },
    { wasItAnAttempt: "true" },
    { location: "cordoba" },
    { murderWeapon: "ARMA_DE_FUEGO" },
    { victimBondAggressor: "EX_PAREJA" },
  ]) {
    const body = await statsWith(params);
    assert.equal(body.total, 1, JSON.stringify(params));
  }
});

test("filters by date range (fromDate inclusive, toDate exclusive)", async () => {
  await Promise.all(
    ["2025-01-01", "2025-02-01", "2025-03-01"].map((occurredAt) =>
      createCase({ occurredAt }),
    ),
  );

  const body = await statsWith({
    fromDate: "2025-02-01",
    toDate: "2025-03-01",
  });
  assert.equal(body.total, 1);
});

test("ignores undeclared name filters instead of failing", async () => {
  await createCase();

  const body = await statsWith({ victimFullName: "nadie" });
  assert.equal(body.total, 1);
});

test("rejects invalid filter values", async () => {
  const res = await api("/v1/cases/stats?province=NOWHERE", {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 422);
});
