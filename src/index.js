import Koa from "koa";
import routers from "./routers/index.js";
import cors from "@koa/cors";
import {bodyParser} from "@koa/bodyparser";
import {logRequest} from "./middleware/log.js";
import {logger} from "./services/logger.js";

const app = new Koa();

logger.info("Setting up application middleware");
app.use(logRequest());
app.use(cors());
app.use(bodyParser());

logger.info("Setting up routes");
routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});


logger.info(`Starting application on port ${8080}`);
app.listen(8080);
