import assert from "node:assert";
import {createLogger, format, transports} from "winston";
import config from '../config/values.js';

const cloudLoggingFormat = format(({level, ...data}) => ({
  level,
  severity: level.toUpperCase(),
  timestamp: new Date().toISOString(),
  ...data,
}));

const getOutputFormatter = () => {
  switch (config.logs.format) {
    case "pretty":
      return format.prettyPrint({colorize: true});
    case "cloud":
      return format.json();
    default:
      throw new assert.AssertionError({ message: `Invalid log format ${config.logs.format}`});
  }
}

export const logger = createLogger({
  format: format.combine(
    format.errors({stack: true}),
    cloudLoggingFormat(),
    getOutputFormatter(),
  ),
  transports: [
    new transports.Console(),
  ],
});
