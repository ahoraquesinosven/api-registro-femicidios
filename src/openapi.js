import Router from "@koa/router";
import config from "./config/values.js";
import {checkUserAuth, checkServerAuth, requireAuth} from "./middleware/auth.js";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({coerceTypes: true, allErrors: true});
addFormats(ajv);

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
    securityRequirement: {"oauth": []},
    requestValidator: checkUserAuth,
  },

  internal: {
    component: {
      type: "apiKey",
      description: "API Key security scheme used for internal endpoints",
      name: "authorization",
      in: "header",
    },
    securityRequirement: {"internal": []},
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

const getParameterValue = (ctx, paramSpec) => {
  switch (paramSpec.in) {
    case "query":
      return request.query[paramSpec.name];
    case "path":
      return request.params[paramSpec.name];
    case "header":
      return request.headers[paramSpec.name];
    case "cookie":
      return ctx.cookies.get(paramSpec.name);
  }
};

const validateParameter = (ctx, paramSpec) => {
  const paramValue = getParameterValue(ctx, paramSpec);

  if (paramSpec.required && !paramValue) {
    return [{
      type: "parameter",
      param: paramSpec.name,
      message: `is required`,
    }];
  }

  if (paramValue) {
    const validate = ajv.compile(paramSpec.schema);

    if (!validate(paramValue)) {
      return validate.errors.map((error) => ({
        type: "parameter",
        param: paramSpec.name,
        message: error.message,
        extraInfo: error.params,
      }));
    }
  }

  return [];
};

const validateBody = (request, bodySpec) => {
  if (!bodySpec) {
    return [];
  }

  const mediaTypeSpec = bodySpec.content[request.type];
  if (!mediaTypeSpec) {
    return [{
      type: "body",
      message: `Request content-type ${request.type} is not supported`,
    }];
  }

  if (bodySpec.required || !request.body) {
    return [{
      type: "body",
      message: "is required",
    }];
  }

  if (request.body) {
    const validate = ajv.compile(mediaTypeSpec.schema);

    if (!validate(request.body)) {

      return validate.errors.map((error) => ({
        type: "body",
        path: error.instancePath,
        message: error.message,
        extraInfo: error.params,
      }));
    }
  }

  return [];
};

const requestValidationMiddleware = (operationSpec) => {
  return (ctx, next) => {
    const parametersSpec = operationSpec.parameters || [];
    const parametersErrors = parametersSpec.flatMap(
      (paramSpec) => validateParameter(ctx, paramSpec)
    );

    const bodySpec = operationSpec.requestBody;
    const bodyErrors = validateBody(ctx.request, bodySpec);

    const errors = [...parametersErrors, ...bodyErrors];

    if (errors.length > 0) {
      ctx.status = 422;
      ctx.body = errors;
      return;
    }

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

