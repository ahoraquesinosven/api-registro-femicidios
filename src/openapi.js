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

  constructor(nativeRouter) {
    this.nativeRouter = nativeRouter;
  }

  operation(options) {
    this.nativeRouter[options.method](
      options.spec.operationId,
      options.relativePath,
      ...options.handlers,
    );
    openApiDocument.registerOperation(
      this.nativeRouter.url(options.spec.operationId),
      options.method,
      options.spec,
    );
  }
}


