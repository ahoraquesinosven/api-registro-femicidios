import assert from "node:assert/strict";
import { test } from "node:test";
import { caseBody, createCase } from "./helpers/cases.js";
import { useTestHarness } from "./helpers/harness.js";
import { assertConformsToSpec } from "./helpers/openapi.js";
import { api } from "./helpers/server.js";

// PUT /v1/cases/{caseId}. Cases get id 1 because resetDb RESTART IDENTITY runs
// before each test.
const ctx = useTestHarness();

const put = (id, overrides, headers = { authorization: ctx.bearer }) =>
  api(`/v1/cases/${id}`, { method: "PUT", headers, body: caseBody(overrides) });

const getCase = async (id) => {
  const res = await api(`/v1/cases/${id}`, {
    headers: { authorization: ctx.bearer },
  });
  return [res.status, await res.json()];
};

test("returns 401 without auth", async () => {
  const res = await api("/v1/cases/1", { method: "PUT", body: caseBody() });
  assert.equal(res.status, 401);
});

test("returns 404 for an unknown id", async () => {
  const res = await put(9999, {});
  assert.equal(res.status, 404);
});

test("updates the case fields", async () => {
  await createCase();

  const res = await put(1, {
    generalNotes: "actualizado",
    location: "Rosario",
  });
  assert.equal(res.status, 204);

  const [status, body] = await getCase(1);
  assert.equal(status, 200);
  assert.equal(body.generalNotes, "actualizado");
  assert.equal(body.location, "Rosario");
});

test("resets fields omitted from the update to null", async () => {
  await createCase({ generalNotes: "nota original" });

  // PUT without generalNotes — the default-null merge should wipe it.
  const res = await put(1, {});
  assert.equal(res.status, 204);

  const [, body] = await getCase(1);
  assert.equal(body.generalNotes, undefined);
});

test("rejects an update that violates a cross-field rule", async () => {
  await createCase();

  const res = await put(1, {
    organizedCrimeNotes: "algo",
    isRelatedToOrganizedCrime: false,
  });
  assert.equal(res.status, 422);
});

test("the updated case still conforms to the OpenAPI spec", async () => {
  await createCase();
  await put(1, { generalNotes: "actualizado" });

  const [, body] = await getCase(1);
  assertConformsToSpec("get", "/v1/cases/{caseId}", 200, body);
});
