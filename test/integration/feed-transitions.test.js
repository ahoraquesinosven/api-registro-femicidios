import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {knex} from "./helpers/db.js";
import {useTestHarness} from "./helpers/harness.js";
import {seedTestUser, bearerFor} from "./helpers/auth.js";
import {seedFeedItem} from "./helpers/feed.js";

// Feed item state transitions — these exercise the seeded-user identity path:
// the handler assigns/completes using ctx.state.auth.id from the minted token.
const ctx = useTestHarness();

const transition = (id, verb, method, bearer = ctx.bearer) =>
  api(`/v1/feed/items/${id}/${verb}`, {method, headers: {authorization: bearer}});

const itemRow = async (id, ...columns) => {
  const [row] = await knex("feedItems").where({id}).select(...columns);
  return row;
};

test("POST assignment assigns the item to the current user", async () => {
  const id = await seedFeedItem();

  const res = await transition(id, "assignment", "POST");
  assert.equal(res.status, 204);

  const row = await itemRow(id, "assignedUserId");
  assert.equal(row.assignedUserId, ctx.user.id);
});

test("DELETE assignment unassigns the item", async () => {
  const id = await seedFeedItem({assignedUserId: null});
  await transition(id, "assignment", "POST");

  const res = await transition(id, "assignment", "DELETE");
  assert.equal(res.status, 204);

  const row = await itemRow(id, "assignedUserId");
  assert.equal(row.assignedUserId, null);
});

test("POST completion only succeeds once the item is assigned to the user", async () => {
  const id = await seedFeedItem();

  // Not assigned yet -> ownership where({id, assignedUserId}) matches nothing.
  const early = await transition(id, "completion", "POST");
  assert.equal(early.status, 422);

  await transition(id, "assignment", "POST");
  const done = await transition(id, "completion", "POST");
  assert.equal(done.status, 204);

  const row = await itemRow(id, "isDone", "assignedUserId");
  assert.equal(row.isDone, true);
  assert.equal(row.assignedUserId, ctx.user.id);
});

test("DELETE completion moves an assigned item back to in progress", async () => {
  const id = await seedFeedItem();
  await transition(id, "assignment", "POST");
  await transition(id, "completion", "POST");

  const res = await transition(id, "completion", "DELETE");
  assert.equal(res.status, 204);

  const row = await itemRow(id, "isDone");
  assert.equal(row.isDone, false);
});

test("POST then DELETE irrelevant toggles the flag", async () => {
  const id = await seedFeedItem();

  const marked = await transition(id, "irrelevant", "POST");
  assert.equal(marked.status, 204);
  let row = await itemRow(id, "isIrrelevant", "assignedUserId");
  assert.equal(row.isIrrelevant, true);
  assert.equal(row.assignedUserId, ctx.user.id);

  const unmarked = await transition(id, "irrelevant", "DELETE");
  assert.equal(unmarked.status, 204);
  row = await itemRow(id, "isIrrelevant", "assignedUserId");
  assert.equal(row.isIrrelevant, false);
  assert.equal(row.assignedUserId, null);
});

test("transitions return 422 for a non-existent item", async () => {
  for (const [verb, method] of [
    ["assignment", "POST"],
    ["assignment", "DELETE"],
    ["completion", "POST"],
    ["completion", "DELETE"],
    ["irrelevant", "POST"],
    ["irrelevant", "DELETE"],
  ]) {
    const res = await transition(9999, verb, method);
    assert.equal(res.status, 422, `${method} ${verb} on missing item`);
  }
});

test("a user cannot complete another user's item", async () => {
  const id = await seedFeedItem();
  await transition(id, "assignment", "POST"); // assigned to ctx.user

  const other = await seedTestUser({providerId: "other-user", email: "other@example.com"});
  const otherBearer = await bearerFor(other);

  const res = await transition(id, "completion", "POST", otherBearer);
  assert.equal(res.status, 422);

  const row = await itemRow(id, "isDone");
  assert.equal(row.isDone, false);
});

test("transitions require auth", async () => {
  const id = await seedFeedItem();
  const res = await api(`/v1/feed/items/${id}/assignment`, {method: "POST"});
  assert.equal(res.status, 401);
});
