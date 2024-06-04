import Koa from "koa";
import routers from "./routers/index.js";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";

const app = new Koa();

app.use(cors());
app.use(bodyParser());

routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

app.listen(8080);
