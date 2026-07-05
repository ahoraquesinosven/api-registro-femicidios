import assert from "node:assert/strict";
import { test } from "node:test";
import { createCase } from "./helpers/cases.js";
import { useTestHarness } from "./helpers/harness.js";
import { assertConformsToSpec } from "./helpers/openapi.js";
import { api } from "./helpers/server.js";

// GET /v1/cases (keyset-paginated list)
const ctx = useTestHarness();

// Follows the `next` cursor recursively, accumulating every returned id.
const collectIds = async (start = null, acc = []) => {
  const qs = new URLSearchParams({ limit: "2" });
  if (start) qs.set("start", start);

  const res = await api(`/v1/cases?${qs}`, {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 200);
  const body = await res.json();

  const ids = [...acc, ...body.page.map((c) => c.id)];
  return body.next ? collectIds(body.next, ids) : ids;
};

test("returns 401 without auth", async () => {
  const res = await api("/v1/cases");
  assert.equal(res.status, 401);
});

test("returns a paginated page", async () => {
  await createCase();

  const res = await api("/v1/cases", {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.page.length, 1);
});

test("page conforms to the OpenAPI spec", async () => {
  await createCase();
  const res = await api("/v1/cases", {
    headers: { authorization: ctx.bearer },
  });
  assertConformsToSpec("get", "/v1/cases", 200, await res.json());
});

test("keyset pagination walks every row without gaps or duplicates", async () => {
  await Promise.all(
    ["2025-01-01", "2025-02-01", "2025-03-01"].map((occurredAt) =>
      createCase({ occurredAt }),
    ),
  );

  const seen = await collectIds();

  assert.equal(seen.length, 3);
  assert.equal(new Set(seen).size, 3);
});

test("returns 400 for an invalid cursor", async () => {
  const res = await api("/v1/cases?start=not-a-valid-cursor", {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.message, "Invalid cursor");
});

// --- Filtering ---

const listWith = async (params) => {
  const res = await api(`/v1/cases?${new URLSearchParams(params)}`, {
    headers: { authorization: ctx.bearer },
  });
  assert.equal(res.status, 200);
  return res.json();
};

test("filters by province", async () => {
  await createCase({ province: "BUENOS_AIRES" });
  await createCase({ province: "CORDOBA" });

  const body = await listWith({ province: "CORDOBA" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].province, "CORDOBA");
});

test("filters by caseCategory", async () => {
  await createCase({ caseCategory: "FEMICIDIO_DIRECTO" });
  await createCase({ caseCategory: "FEMICIDIO_VINCULADO" });

  const body = await listWith({ caseCategory: "FEMICIDIO_VINCULADO" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].caseCategory, "FEMICIDIO_VINCULADO");
});

test("filters by wasItAnAttempt", async () => {
  await createCase({ wasItAnAttempt: true });
  await createCase({ wasItAnAttempt: false });

  const body = await listWith({ wasItAnAttempt: "true" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].wasItAnAttempt, true);
});

test("filters location case- and accent-insensitively", async () => {
  await createCase({ location: "Córdoba" });
  await createCase({ location: "Rosario" });

  const body = await listWith({ location: "cordoba" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].location, "Córdoba");
});

test("matches victim full name by token", async () => {
  await createCase({ victim: { fullName: "Maria Gomez" } });
  await createCase({ victim: { fullName: "Juan Perez" } });

  const body = await listWith({ victimFullName: "gomez" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].victim.fullName, "Maria Gomez");
});

test("matches aggressor full name by token", async () => {
  await createCase({ aggressor: { fullName: "Carlos Diaz" } });
  await createCase({ aggressor: { fullName: "Pedro Ruiz" } });

  const body = await listWith({ aggressorFullName: "ruiz" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].aggressor.fullName, "Pedro Ruiz");
});

test("filters by date range (fromDate inclusive, toDate exclusive)", async () => {
  await Promise.all(
    ["2025-01-01", "2025-02-01", "2025-03-01"].map((occurredAt) =>
      createCase({ occurredAt }),
    ),
  );

  const body = await listWith({ fromDate: "2025-02-01", toDate: "2025-03-01" });
  assert.equal(body.total, 1);
  assert.equal(body.page[0].occurredAt, "2025-02-01");
});

test("limit=0 returns no rows but the full total", async () => {
  await Promise.all([createCase(), createCase()]);

  const body = await listWith({ limit: "0" });
  assert.equal(body.total, 2);
  assert.equal(body.page.length, 0);
  assert.equal(body.next, null);
});

test("returns an empty page when nothing matches", async () => {
  await createCase({ province: "BUENOS_AIRES" });

  const body = await listWith({ province: "TUCUMAN" });
  assert.equal(body.total, 0);
  assert.deepEqual(body.page, []);
});
