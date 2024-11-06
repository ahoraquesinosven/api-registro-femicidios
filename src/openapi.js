import Router from "@koa/router";
import config from "./config/values.js";
import {requireUserAuth, requireServerAuth} from "./middleware/auth.js";

export const securitySchemes = {
  oauth: {
    component: {
      type: "oauth2",
      description: "OAuth2.0 security scheme used for public endpoints",
      flows: {
        authorizationCode: {
          authorizationUrl: "/auth/authorize",
          tokenUrl: "/auth/token",
          scopes: {},
        },
      },
    },
    endpointSpec: [{oauth: []}],
    middleware: requireUserAuth,
  },

  internal: {
    component: {
      type: "apiKey",
      description: "API Key security scheme used for internal endpoints",
      name: "authorization",
      in: "header",
    },
    endpointSpec: [{internal: []}],
    middleware: requireServerAuth,
  },
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "AQSNV - Registro de Femicidios",
    version: "1.0.0",
  },
  servers: [
    {url: config.server.cannonicalOrigin},
  ],
  components: {
    securitySchemes: {
      oauth: securitySchemes.oauth.component,
      internal: securitySchemes.internal.component,
    },
  },
  paths: {},
};

export class OpenApiRouter {
  nativeRouter;
  prefix;

  constructor({prefix, ...opts}) {
    this.prefix = prefix;
    this.nativeRouter = new Router({
      ...opts,
      prefix,
    });
  }

  registerNativeRoute(options) {
    const path = options.relativePath.replaceAll(/{(\w+)}/g, (_, group) => `:${group}`);
    const securityHandlers = options.spec.security ? [options.spec.security.middleware] : [];
    this.nativeRouter[options.method](
      path,
      ...securityHandlers,
      ...options.handlers,
    );
  }

  registerOpenApiDocumentPath(options) {
    const path = `${this.prefix}${options.relativePath}`;
    const pathObject = (openApiDocument.paths[path] ||= {});
    const security = options.spec.security ? { security: options.spec.security.endpointSpec } : {};
    pathObject[options.method] = {
      ...options.spec,
      ...security,
    };
  }

  operation(options) {
    this.registerNativeRoute(options);
    this.registerOpenApiDocumentPath(options);
  }
}

