import config from "../config/values.js";
import { securitySchemes } from "./securitySchemes.js";
import schemas from "./schemas.js";
import responses from "./responses.js";

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

    responses,
    schemas,
  },
  paths: {},
};
