import {checkUserAuth, checkServerAuth, requireAuth} from "../middleware/auth.js";

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


export function securityMiddleware(operationSpec) {
  if (!operationSpec.security) {
    return [];
  }

  const checkers = operationSpec.security.map(spec => spec.requestValidator);
  return [requireAuth(checkers)];
}

export function openApiSecurityRequirement(operationSpec) {
  if (!operationSpec.security) {
    return {};
  }

  return {
    security: operationSpec.security.map(spec => spec.securityRequirement),
  };
}
