import Router from "@koa/router";
import {requireUserAuth} from "../middleware/auth.js";
import {OpenApiRouter} from "../openapi.js";

const router = new OpenApiRouter({
  prefix: "/v1/profiles",
});

router.operation({
  relativePath: "/me",
  method: "get",
  spec: {
    tags: ["auth"],
    summary: "Retrieves the current user profile",
    security: [{"oauth": []}],
    responses: {
      "200": {
        description: "Successful response",
      },
    },

  },

  handlers: [
    requireUserAuth,
    async (ctx) => {
      ctx.body = {
        name: ctx.state.token.name,
        pictureUrl: ctx.state.token.picture,
      };
    }
  ],
})

export default router.nativeRouter;
