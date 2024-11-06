import Router from "@koa/router";
import { openApiDocument } from "../openapi.js";

const router = new Router({
  prefix: "/v1",
});

router.get("/openapi.json", (ctx) => {
  ctx.body = openApiDocument;
});

export default router;
