import Router from "@koa/router";
import config from '../config/values.js';
import {buildAuthorizationURL, exchangeAuthorizationCode} from '../services/google.js';
import {createXSRFToken} from "../lib/security.js";

const router = new Router({
  prefix: "/auth",
});

const absoluteURL = (routeName) => new URL(
  router.url(routeName),
  config.server.cannonicalOrigin,
);

router.get("issuer", "/", async (ctx) => {
  ctx.response.redirect(ctx.router.url("discovery"));
});

router.get("discovery", "/.well-known/openid-configuration", async (ctx) => {
  ctx.body = {
    issuer: absoluteURL("issuer", ctx),
    authorization_endpoint: absoluteURL("authorize"),
    token_endpoint: absoluteURL("token"),
    userinfo_endpoint: absoluteURL("user"),
    response_types_supported: ["code"],
  };
});

router.get("authorize", "/authorize", async (ctx) => {
  const xsrfToken = createXSRFToken();
  const state = new URLSearchParams();
  state.append("xsrf", xsrfToken);

  const authorizationURL = await buildAuthorizationURL({
    callbackURL: absoluteURL("google"),
    state: state.toString(),
  });

  ctx.cookies.set("xsrf-token", xsrfToken, {
    maxAge: 1000 * 60 * 5, // 5 minutes in milliseconds
    httpOnly: true,
    sameSite: "lax",
  });
  ctx.response.redirect(authorizationURL);
});

router.get("google", "/cb/google", async (ctx) => {
  const storedXSRFToken = ctx.cookies.get("xsrf-token");
  const state = new URLSearchParams(ctx.request.query.state);
  const receivedXSRFToken = state.get("xsrf");
  if (!storedXSRFToken || !receivedXSRFToken || storedXSRFToken !== receivedXSRFToken) {
    ctx.status = 422;
    return;
  }

  const authorizationCode = ctx.request.query.code;
  const token = await exchangeAuthorizationCode({
    callbackURL: absoluteURL("google"),
    authorizationCode,
  });

  ctx.body = {
    response: token,
  };
});

router.get("token", "/token", async (ctx) => {
  // TODO: Implement this
});

router.get("user", "/me", async (ctx) => {
  // TODO: Implement this
});

export default router;
