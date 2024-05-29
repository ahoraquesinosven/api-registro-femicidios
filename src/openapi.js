class OpenApiDocument {
  document = {
    openapi: "3.1.0",
    info: {
      title: "AQSNV - Registro de Femicidios",
    },
    components: {
      securitySchemes: {
        oauth: {
          type: "oauth2",
          description: "OAuth2.0 security scheme used for public endpoints",
          flows: {
            authorizationCode: {
              authorizationUrl: "http://localhost:8080/auth/authorize",
              tokenUrl: "http://localhost:8080/auth/token",
              scopes: [],
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

export default new OpenApiDocument();
