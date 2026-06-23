import {before, after, beforeEach} from "node:test";

import {startTestServer, stopTestServer} from "./server.js";
import {resetDb, closeDb} from "./db.js";
import {seedTestUser, bearerFor} from "./auth.js";

// Registers the standard lifecycle for an endpoint test file: start the server
// once, reset the DB + seed a fresh user before each test, tear down at the end.
// Returns a context object whose `user`/`bearer` are refreshed before each test.
export function useTestHarness() {
  const ctx = {user: null, bearer: null};

  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
    await closeDb();
  });

  beforeEach(async () => {
    await resetDb();
    ctx.user = await seedTestUser();
    ctx.bearer = await bearerFor(ctx.user);
  });

  return ctx;
}
