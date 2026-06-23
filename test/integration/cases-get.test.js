import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {useTestHarness} from "./helpers/harness.js";
import {assertConformsToSpec} from "./helpers/openapi.js";
import {createCase} from "./helpers/cases.js";

// GET /v1/cases/{caseId}
const ctx = useTestHarness();

test("returns 401 without auth", async () => {
  const res = await api("/v1/cases/1");
  assert.equal(res.status, 401);
});

test("returns the requested case", async () => {
  await createCase();

  const res = await api("/v1/cases/1", {headers: {authorization: ctx.bearer}});
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, 1);
});

test(
  "response conforms to the OpenAPI spec",
  {
    todo: "GET /{id} validates against the request Case schema: it lacks `id` and types optional fields non-nullable",
  },
  async () => {
    await createCase();
    const res = await api("/v1/cases/1", {headers: {authorization: ctx.bearer}});
    assertConformsToSpec("get", "/v1/cases/{caseId}", 200, await res.json());
  },
);

test("returns 404 for an unknown id", async () => {
  const res = await api("/v1/cases/9999", {headers: {authorization: ctx.bearer}});
  assert.equal(res.status, 404);
});
