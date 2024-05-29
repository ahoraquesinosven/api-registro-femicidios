import config from "../config/values.js";
import { tokenRequest } from "../lib/oauth.js";

export async function requireUserAuth(ctx, next) {
  const authorization = ctx.request.headers["authorization"];
  if (!authorization) {
    ctx.status = 401;
    return;
  }

  const parsedAuthorization = authorization.match(/bearer (\S*)/i);
  if (!parsedAuthorization) {
    ctx.status = 401;
    return;
  }

  const token = parsedAuthorization[1];
  let payload;
  try {
    payload = await tokenRequest.verifyAccessToken(token);
  } catch (e) {
    ctx.status = 401;
  }

  ctx.state.token = payload;
  return next();
}

export async function requireServerAuth(ctx, next) {
  const authorization = ctx.request.headers["authorization"];
  if (!authorization) {
    ctx.status = 401;
    return;
  }

  const parsedAuthorization = authorization.match(/basic (\S*)/i);
  if (!parsedAuthorization) {
    ctx.status = 401;
    return;
  }

  const key = parsedAuthorization[1];
  if (key !== config.auth.internal.key) {
    ctx.status = 401;
    return;
  }

  return next();
}
