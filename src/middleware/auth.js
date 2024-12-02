import config from "../config/values.js";
import { tokenRequest } from "../lib/oauth.js";

export async function checkUserAuth(ctx) {
  const authorization = ctx.request.headers["authorization"];
  if (!authorization) {
    return { authorized: false };
  }

  const parsedAuthorization = authorization.match(/bearer (\S*)/i);
  if (!parsedAuthorization) {
    return { authorized: false };
  }

  const token = parsedAuthorization[1];
  try {
    const payload = await tokenRequest.verifyAccessToken(token);

    return {
      authorized: true,
      payload,
    };
  } catch (e) {
    return { authorized: false };
  }
}

export async function checkServerAuth(ctx) {
  const authorization = ctx.request.headers["authorization"];
  if (!authorization) {
    return { authorized: false };
  }
  if (authorization !== config.auth.internal.key) {
    return { authorized: false };
  }

  return { authorized: true };
}

export function requireAuth(supportedCheckers) {
  return async (ctx, next) => {
    for (const checker of supportedCheckers) {
      const authorizationResult = await checker(ctx);

      if (authorizationResult.authorized) {
        ctx.state.auth = authorizationResult.payload;
        return next();
      }
    }

    ctx.status = 401;
    return;
  }
}
