import Koa from "koa";
import cors from "@koa/cors";
import routers from "./routers/index.js";

const app = new Koa();

app.use(cors());

routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

app.listen(8080);
