import config from "../config/values.js";
import { securitySchemes } from "./securitySchemes.js";
import { ValidationErrorResponse } from "./validations.js";
import schemas from "./schemas.js";



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

    responses: {
      ValidationError: ValidationErrorResponse,
    },

    schemas,
  },
  paths: {},
};
