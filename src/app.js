import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";
import Koa from "koa";
import { handleCursorErrors } from "./middleware/cursorError.js";
import { logRequest } from "./middleware/log.js";
import routers from "./routers/index.js";
import { logger } from "./services/logger.js";

const app = new Koa();

logger.info("Setting up application middleware");
app.use(logRequest());
app.use(cors());
app.use(bodyParser());
app.use(handleCursorErrors());

logger.info("Setting up routes");
routers.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

export default app;
