import Koa from "koa";
import routers from "./routers/index.js";
import koaBody from "koa-body" ;

const app = new Koa();
app.use(koaBody);

routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

app.listen(8080);
