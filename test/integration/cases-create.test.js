import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {knex} from "./helpers/db.js";
import {INTERNAL_KEY} from "./helpers/auth.js";
import {useTestHarness} from "./helpers/harness.js";
import {caseBody, createCase} from "./helpers/cases.js";

// POST /v1/cases
// Happy path + auth only for now. The cross-field validation matrix
// (caseValidations + schema dependentRequired) is a follow-up once the harness
// is proven.
useTestHarness();

test("creates the case, victim and aggressor (internal key)", async () => {
  const res = await createCase();
  assert.equal(res.status, 201);

  const [{count: cases}] = await knex("cases").count("id as count");
  const [{count: victims}] = await knex("victims").count("id as count");
  const [{count: aggressors}] = await knex("aggressors").count("id as count");
  assert.equal(Number(cases), 1);
  assert.equal(Number(victims), 1);
  assert.equal(Number(aggressors), 1);
});

test("returns 401 without auth", async () => {
  const res = await api("/v1/cases", {method: "POST", body: caseBody()});
  assert.equal(res.status, 401);
});
