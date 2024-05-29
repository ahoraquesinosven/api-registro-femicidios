import Router from "@koa/router";
import OpenApiDocument from "../openapi.js";

const router = new Router({
  prefix: "/v1",
});

router.get("/openapi.json", (ctx) => {
  ctx.body = OpenApiDocument.document;
});

export default router;
