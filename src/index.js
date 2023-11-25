import Koa from "koa";
import routers from "./routers/index.js";

const app = new Koa();

routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

app.listen(8080);
