import {test} from "node:test";
import assert from "node:assert/strict";

import {api} from "./helpers/server.js";
import {knex} from "./helpers/db.js";
import {useTestHarness} from "./helpers/harness.js";
import {assertConformsToSpec} from "./helpers/openapi.js";
import {INTERNAL_KEY} from "./helpers/auth.js";
import {seedFeedItem, seedFeedItems} from "./helpers/feed.js";

// GET /v1/feed/items (status-filtered, keyset-paginated) and POST /v1/feed/refresh.
const ctx = useTestHarness();

const list = (params = {}) => {
  const qs = new URLSearchParams({limit: "50", ...params});
  return api(`/v1/feed/items?${qs}`, {headers: {authorization: ctx.bearer}});
};

// Follows the `next` cursor, accumulating every returned id. The feed paginator
// returns a cursor whenever a page is non-empty, so the walk ends on the first
// empty page rather than on a null cursor.
const collectIds = async (params, start = null, acc = []) => {
  const res = await api(
    `/v1/feed/items?${new URLSearchParams({...params, ...(start ? {start} : {})})}`,
    {headers: {authorization: ctx.bearer}},
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  if (body.page.length === 0) return acc;
  const ids = [...acc, ...body.page.map((i) => i.id)];
  return collectIds(params, body.next, ids);
};

test("returns 401 without auth", async () => {
  const res = await api("/v1/feed/items");
  assert.equal(res.status, 401);
});

test("returns items and conforms to the OpenAPI spec", async () => {
  await seedFeedItem();

  const res = await list();
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.page.length, 1);
  assertConformsToSpec("get", "/v1/feed/items", 200, body);
});

test("filters by status", async () => {
  await seedFeedItem({feedItemKey: "backlog", link: "https://news.example/b"});
  const inProgress = await seedFeedItem({feedItemKey: "inprog", link: "https://news.example/i"});
  const done = await seedFeedItem({feedItemKey: "done", link: "https://news.example/d"});
  await knex("feedItems").where({id: inProgress}).update({assignedUserId: ctx.user.id});
  await knex("feedItems").where({id: done}).update({isDone: true});

  for (const [status, expectedId] of [
    ["backlog", null],
    ["inProgress", inProgress],
    ["done", done],
  ]) {
    const res = await list({status});
    const body = await res.json();
    assert.equal(body.total, 1, `status=${status} total`);
    assert.equal(body.page.length, 1, `status=${status} page`);
    if (expectedId) assert.equal(body.page[0].id, expectedId);
  }
});

test("keyset pagination walks every backlog item without gaps or duplicates", async () => {
  await seedFeedItems(3);

  const seen = await collectIds({status: "backlog", limit: "2"});

  assert.equal(seen.length, 3);
  assert.equal(new Set(seen).size, 3);
});

test("returns 400 for an invalid cursor", async () => {
  const res = await list({start: "not-a-valid-cursor"});
  assert.equal(res.status, 400);
});

test("refresh requires the internal key", async () => {
  // No happy-path assertion here: the handler fetches live Google Alerts feeds,
  // so 204 would hit the network. Auth is rejected before the handler runs.
  const noAuth = await api("/v1/feed/refresh", {method: "POST"});
  assert.equal(noAuth.status, 401);

  const userAuth = await api("/v1/feed/refresh", {
    method: "POST",
    headers: {authorization: ctx.bearer},
  });
  assert.equal(userAuth.status, 401);
});
