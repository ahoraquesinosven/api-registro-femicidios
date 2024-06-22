import {createLogger, format, transports} from "winston";

const cloudLoggingFormat = format(({level, ...data}) => ({
  severity: level.toUpperCase(),
  timestamp: new Date().toISOString(),
  ...data,
}));

export const logger = createLogger({
  format: format.combine(
    format.errors({stack: true}),
    cloudLoggingFormat(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
  ],
});
