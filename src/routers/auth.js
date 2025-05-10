import Router from "@koa/router";
import config from '../config/values.js';
import {buildAuthorizationURL, exchangeAuthorizationCode, verifyGoogleTokenValues} from '../services/google/openid.js';
import {createPKCEPair, createXSRFToken} from "../lib/crypto.js";
import {authorizationRequest, tokenRequest} from "../lib/oauth.js";
import { upsertUser } from "../data/user.js";
import { logger } from "../services/logger.js";

const router = new Router({
  prefix: "/auth",
});

const absoluteURL = (routeName) => new URL(
  router.url(routeName),
  config.server.cannonicalOrigin,
);

router.get("/pkce", async (ctx) => {
  ctx.body = createPKCEPair();
});

router.get("authorize", "/authorize", async (ctx) => {
  const validationError = authorizationRequest.validate(ctx.request);
  if (validationError) {
    if (validationError.canRedirect) {
      const responseUrl = authorizationRequest.errorResponse(
        config.auth.provider.redirectUri,
        validationError,
        ctx.request.query.state
      );
      ctx.redirect(responseUrl);
      return;
    } else {
      const {error, error_description} = validationError;
      ctx.status = 422;
      ctx.body = {error, error_description};
      return;
    }
  }

  const xsrfToken = createXSRFToken();
  ctx.cookies.set("xsrf-token", xsrfToken, {
    maxAge: 1000 * 60 * 5, // 5 minutes in milliseconds
    httpOnly: true,
    sameSite: "lax",
  });

  const state = new URLSearchParams();
  state.append("xsrf", xsrfToken);
  state.append("cc", ctx.request.query.code_challenge);
  state.append("originalState", ctx.request.query.state);

  const authorizationURL = await buildAuthorizationURL({
    callbackURL: absoluteURL("google"),
    state: state.toString(),
  });
  ctx.response.redirect(authorizationURL);
});

router.get("google", "/cb/google", async (ctx) => {
  const state = new URLSearchParams(ctx.request.query.state);
  const storedXSRFToken = ctx.cookies.get("xsrf-token");
  const receivedXSRFToken = state.get("xsrf");
  if (!storedXSRFToken || !receivedXSRFToken || storedXSRFToken !== receivedXSRFToken) {
    logger.warn("invalid XSRFtoken");
    ctx.status = 422;
    return;
  }

  const originalState = state.get("originalState");
  const codeChallenge = state.get("cc");
  const googleCode = ctx.request.query.code;

  const code = await authorizationRequest.createAuthorizationCode(
    googleCode,
    codeChallenge,
  );

  const responseUrl = authorizationRequest.successResponse(
    config.auth.provider.redirectUri,
    code,
    originalState
  );
  ctx.response.redirect(responseUrl);
});

router.post("token", "/token", async (ctx) => {
  const {validationError, codePayload} = await tokenRequest.verify(ctx.request);
  if (validationError) {
    ctx.status = 422;
    ctx.body = validationError;
    return;
  }

  const googleToken = await exchangeAuthorizationCode({
    callbackURL: absoluteURL("google"),
    code: codePayload,
  });

  if (!verifyGoogleTokenValues(googleToken)) {
    ctx.status = 422;
    return;
  }

  const user = await upsertUser({
    provider: "google",
    providerId: googleToken.sub,
    name: googleToken.name,
    email: googleToken.email,
    pictureUrl: googleToken.picture,
  });

  const token = await tokenRequest.createAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.pictureUrl,
  });

  ctx.status = 200;
  ctx.body = {
    access_token: token,
    token_type: 'Bearer',
    expires_in: 24 * 60 * 60,
    scope: "",
  };
});

export default router;
