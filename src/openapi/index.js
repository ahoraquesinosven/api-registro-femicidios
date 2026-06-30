import Router from "@koa/router";
import { securityMiddleware, openApiSecurityRequirement } from "./securitySchemes.js";
import { requestValidationMiddleware } from "./validations.js";
import { openApiDocument } from "./document.js"

export class OpenApiRouter {
  nativeRouter;
  prefix;

  constructor({prefix, ...opts}) {
    this.prefix = prefix;
    this.nativeRouter = new Router({
      prefix,
      ...opts,
    });
  }

  registerNativeRoute(options) {
    const path = options.relativePath.replaceAll(/{(\w+)}/g, (_, group) => `:${group}`);

    this.nativeRouter[options.method](
      path,
      ...securityMiddleware(options.spec),
      requestValidationMiddleware(options.spec),
      ...options.handlers,
    );
  }

  registerOpenApiDocumentPath(options) {
    // Koa routing is non-strict so a collection route's "/" relativePath also
    // serves the slashless path; strip the trailing slash here so the emitted
    // spec path (e.g. /v1/cases, not /v1/cases/) conforms to the no-trailing-slash rule.
    const rawPath = `${this.prefix}${options.relativePath}`;
    const path = rawPath.length > 1 ? rawPath.replace(/\/$/, "") : rawPath;
    const pathObject = (openApiDocument.paths[path] ||= {});
    pathObject[options.method] = {
      ...options.spec,
      ...openApiSecurityRequirement(options.spec),
    };
  }

  operation(options) {
    this.registerNativeRoute(options);
    this.registerOpenApiDocumentPath(options);
  }
}

