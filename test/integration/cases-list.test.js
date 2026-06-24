import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {useTestHarness} from "./helpers/harness.js";
import {assertConformsToSpec} from "./helpers/openapi.js";
import {createCase} from "./helpers/cases.js";

// GET /v1/cases (keyset-paginated list)
const ctx = useTestHarness();

// Follows the `next` cursor recursively, accumulating every returned id.
const collectIds = async (start = null, acc = []) => {
  const qs = new URLSearchParams({limit: "2"});
  if (start) qs.set("start", start);

  const res = await api(`/v1/cases?${qs}`, {headers: {authorization: ctx.bearer}});
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

  const res = await api("/v1/cases", {headers: {authorization: ctx.bearer}});
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.page.length, 1);
});

test(
  "page conforms to the OpenAPI spec",
  async () => {
    await createCase();
    const res = await api("/v1/cases", {headers: {authorization: ctx.bearer}});
    assertConformsToSpec("get", "/v1/cases", 200, await res.json());
  },
);

test("keyset pagination walks every row without gaps or duplicates", async () => {
  await Promise.all(
    ["2025-01-01", "2025-02-01", "2025-03-01"].map((occurredAt) =>
      createCase({occurredAt}),
    ),
  );

  const seen = await collectIds();

  assert.equal(seen.length, 3);
  assert.equal(new Set(seen).size, 3);
});

test("returns 400 for an invalid cursor", async () => {
  const res = await api("/v1/cases?start=not-a-valid-cursor", {
    headers: {authorization: ctx.bearer},
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.message, "Invalid cursor");
});
