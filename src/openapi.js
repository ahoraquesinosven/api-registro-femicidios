import Router from "@koa/router";
import config from "./config/values.js";

class OpenApiDocument {
  document = {
    openapi: "3.1.0",
    info: {
      title: "AQSNV - Registro de Femicidios",
      version: "1.0.0",
    },
    servers: [
      { url: config.server.cannonicalOrigin },
    ],
    components: {
      securitySchemes: {
        oauth: {
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

        internal: {
          type: "apiKey",
          description: "API Key security scheme used for internal endpoints",
          name: "authorization",
          in: "header",
        },
      },
    },
  }

  registerOperation(path, method, doc) {
    const pathsObject = (this.document.paths ||= {});
    const pathObject = (pathsObject[path] ||= {});
    pathObject[method] = doc;
  }
}

export const openApiDocument = new OpenApiDocument();

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

  operation(options) {
    const pathForOpenApi = `${this.prefix}${options.relativePath}`;
    const pathForRouter = options.relativePath.replaceAll(/{(\w+)}/g, (_, group) => `:${group}`);
    this.nativeRouter[options.method](
      pathForRouter,
      ...options.handlers,
    );

    openApiDocument.registerOperation(
      pathForOpenApi,
      options.method,
      options.spec,
    );
  }
}

