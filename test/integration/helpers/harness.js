import { after, beforeEach } from "node:test";
import { bearerFor, seedTestUser } from "./auth.js";
import { closeDb, resetDb } from "./db.js";

// Registers the standard lifecycle for an endpoint test file: reset the DB +
// seed a fresh user before each test, close the DB pool at the end. The server
// itself runs as a separate container (see helpers/server.js), so there's
// nothing to start or stop here.
// Returns a context object whose `user`/`bearer` are refreshed before each test.
export function useTestHarness() {
  const ctx = { user: null, bearer: null };

  after(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    await resetDb();
    ctx.user = await seedTestUser();
    ctx.bearer = await bearerFor(ctx.user);
  });

  return ctx;
}
