import { upsertUser } from "../../../src/data/user.js";
import { tokenRequest } from "../../../src/lib/oauth.js";

// Internal (server-to-server) auth: the raw key is sent as the Authorization
// header value (see checkServerAuth). Used by POST /cases.
export const INTERNAL_KEY = process.env.AUTH_INTERNAL_KEY || "9876";

export async function seedTestUser(overrides = {}) {
  return upsertUser({
    provider: "google",
    providerId: "test-user",
    name: "Test User",
    email: "test@example.com",
    pictureUrl: "https://example.com/avatar.png",
    ...overrides,
  });
}

// Mints a real access token for a seeded user, signed with the app's own key.
// Tokens are verified locally (jwtVerify against the same key), so no Google
// round-trip is needed. The payload shape mirrors auth.js createAccessToken.
export async function bearerFor(user) {
  const token = await tokenRequest.createAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.pictureUrl,
  });
  return `Bearer ${token}`;
}
