import app from "./app.js";
import { logger } from "./services/logger.js";

logger.info(`Starting application on port ${8080}`);
app.listen(8080);
