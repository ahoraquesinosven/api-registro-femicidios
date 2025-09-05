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
    const path = `${this.prefix}${options.relativePath}`;
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

