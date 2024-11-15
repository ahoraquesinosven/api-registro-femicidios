import Router from "@koa/router";
import config from "./config/values.js";
import { checkUserAuth, checkServerAuth, requireAuth } from "./middleware/auth.js";
import Ajv from 'ajv';

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
    securityRequirement: { "oauth": [] },
    requestValidator: checkUserAuth,
  },

  internal: {
    component: {
        type: "apiKey",
        description: "API Key security scheme used for internal endpoints",
        name: "authorization",
        in: "header",
      },
    securityRequirement: { "internal": [] },
    requestValidator: checkServerAuth,
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

const securityMiddleware = (operationSpec) => {
  if (!operationSpec.security) {
    return [];
  }

  const checkers = operationSpec.security.map(spec => spec.requestValidator);
  return [requireAuth(checkers)];
}

const openApiSecurityRequirement = (operationSpec) => {
  if (!operationSpec.security) {
    return {};
  }

  return {
    security: operationSpec.security.map(spec => spec.securityRequirement),
  };
}

const requestValidationMiddleware = (operationSpec) => {
  return (ctx, next) => {
    for (const paramSpec of operationSpec.parameters) {
      // TODO: Handle "in", estamos usando solo query
      const paramValue = ctx.request.query[paramSpec.name];
      if (paramSpec.required && !paramValue) {
        ctx.body = {
          message: `${paramSpec.name} is required`,
        };
        ctx.status = 422;
        return;
      }

      if (paramSpec.required || paramValue) {
        const ajv = new Ajv({ coerceTypes: true });
        const validate = ajv.compile(paramSpec.schema);

        if (!validate(paramValue)) {
          console.log(validate.errors);
          ctx.body = validate.errors.map((error) => ({
            param: paramSpec.name,
            message: error.message,
            extraInfo: error.params,
          }));
          ctx.status = 422;
          return;
        }
      }
    }

    // Si esta todo bien
    return next();
  }
}

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

