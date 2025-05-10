import {logger} from "../services/logger.js";

const decideLogLevel = (status) => {
  if (status >= 500) {
    return "error";
  }

  return "info";
}

export function logRequest() {
  return async function logRequest(ctx, next) {
    const start = new Date();
    try {
      await next();
    } catch (err) {
      logger.error({
        message: err.message,
        stack: err.stack,
      });
        ctx.status = 500;
    } finally {
      const durationMs = new Date() - start;

      const httpRequest = {
        requestMethod: ctx.request.method,
        requestUrl: ctx.request.url,
        requestSize: ctx.request.length,
        status: ctx.response.status,
        responseSize: ctx.response.length,
        userAgent: ctx.request.get("user-agent"),
        remoteIp: ctx.request.ip,
        latency: `${durationMs / 1000}s`,
      };

      const message = `${httpRequest.status} ${httpRequest.latency} ${httpRequest.requestMethod} ${httpRequest.requestUrl}`

      logger.log(
        decideLogLevel(ctx.response.status),
        {httpRequest, message},
      );
    }
  };
}
