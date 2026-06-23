import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {knex} from "./helpers/db.js";
import {useTestHarness} from "./helpers/harness.js";

// Feed item state transitions — these exercise the seeded-user identity path:
// the handler assigns/completes using ctx.state.auth.id from the minted token.
const ctx = useTestHarness();

const seedFeedItem = async (overrides = {}) => {
  const [row] = await knex("feedItems").insert(
    {
      feedId: "https://feed.example/rss",
      feedName: "Example Feed",
      feedUpdatedAt: new Date("2025-01-01T00:00:00Z"),
      publishedAt: new Date("2025-01-01T00:00:00Z"),
      feedItemKey: "item-1",
      title: "Some title",
      link: "https://news.example/article-1",
      ...overrides,
    },
    ["id"],
  );
  return row.id;
};

test("POST assignment assigns the item to the current user", async () => {
  const id = await seedFeedItem();

  const res = await api(`/v1/feed/items/${id}/assignment`, {
    method: "POST",
    headers: {authorization: ctx.bearer},
  });
  assert.equal(res.status, 204);

  const [row] = await knex("feedItems").where({id}).select("assignedUserId");
  assert.equal(row.assignedUserId, ctx.user.id);
});

test("POST completion only succeeds once the item is assigned to the user", async () => {
  const id = await seedFeedItem();

  // Not assigned yet -> ownership where({id, assignedUserId}) matches nothing.
  const early = await api(`/v1/feed/items/${id}/completion`, {
    method: "POST",
    headers: {authorization: ctx.bearer},
  });
  assert.equal(early.status, 422);

  await api(`/v1/feed/items/${id}/assignment`, {
    method: "POST",
    headers: {authorization: ctx.bearer},
  });
  const done = await api(`/v1/feed/items/${id}/completion`, {
    method: "POST",
    headers: {authorization: ctx.bearer},
  });
  assert.equal(done.status, 204);

  const [row] = await knex("feedItems").where({id}).select("isDone", "assignedUserId");
  assert.equal(row.isDone, true);
  assert.equal(row.assignedUserId, ctx.user.id);
});

test("transitions require auth", async () => {
  const id = await seedFeedItem();
  const res = await api(`/v1/feed/items/${id}/assignment`, {method: "POST"});
  assert.equal(res.status, 401);
});
