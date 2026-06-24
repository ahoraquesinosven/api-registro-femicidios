import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {useTestHarness} from "./helpers/harness.js";
import {assertConformsToSpec} from "./helpers/openapi.js";

// GET /v1/profiles/me — echoes the authenticated user from the token payload.
const ctx = useTestHarness();

test("returns 401 without auth", async () => {
  const res = await api("/v1/profiles/me");
  assert.equal(res.status, 401);
});

test("returns the current user profile", async () => {
  const res = await api("/v1/profiles/me", {headers: {authorization: ctx.bearer}});
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, ctx.user.name);
  assert.equal(body.pictureUrl, ctx.user.pictureUrl);
});

test("response conforms to the OpenAPI spec", async () => {
  const res = await api("/v1/profiles/me", {headers: {authorization: ctx.bearer}});
  assertConformsToSpec("get", "/v1/profiles/me", 200, await res.json());
});
