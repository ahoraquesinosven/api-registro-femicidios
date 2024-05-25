import config from "../config/values.js";
import {createSignedJwt, verifySignedJwt, verifyPKCEPair} from "./crypto.js";

export const authorizationRequest = {
  errorResponse: (redirectUri, error, state) => {
    const result = new URL(redirectUri);
    result.searchParams.append("error", error.error);
    result.searchParams.append("error_description", error.error_description);
    if (state) {
      result.searchParams.append("state", state);
    }

    return result;
  },

  successResponse: (redirectUri, code, state) => {
    const result = new URL(redirectUri);
    result.searchParams.append("code", code);
    if (state) {
      result.searchParams.append("state", state);
    }

    return result;
  },

  validate: (request) => {
    // Validations which prevent redirection for a normal authorization
    // response
    if (!request.query.client_id) {
      return {
        error: "invalid_request",
        error_description: "client_id is required",
        canRedirect: false
      };
    }
    if (request.query.client_id !== config.auth.provider.acceptedClientId) {
      return {
        error: "invalid_request",
        error_description: "Invalid client_id",
        canRedirect: false
      };
    }

    // Validations that allow response redirection
    for (const param of ["response_type", "code_challenge", "code_challenge_method"]) {
      if (!request.query[param]) {
        return {
          error: "invalid_request",
          error_description: `${param} is required`,
          canRedirect: true
        };
      }
    }
    if (request.query.response_type !== "code") {
      return {
        error: "unsupported_response_type",
        error_description: `Unsupported response_type ${request.query.response_type}`,
        canRedirect: true
      };
    }
    if (request.query.code_challenge_method !== "S256") {
      return {
        error: "invalid_request",
        error_description: `Unsupported code_challenge_method ${request.query.code_challenge_method}`,
        canRedirect: true
      };
    }

    return null;
  },

  createAuthorizationCode: async (payload, codeChallenge) => {
    return createSignedJwt({
      p: payload,
      cc: codeChallenge,
    }, "5 min");
  },
};


export const tokenRequest = {
  verify: async (request) => {
    for (const param of ["grant_type", "code", "code_verifier", "client_id"]) {
      if (!request.body[param]) {
        return {
          validationError: {
            error: "invalid_request",
            error_description: `${param} is required`,
          }
        };
      }
    }
    if (request.body.grant_type !== "authorization_code") {
      return {
        validationError: {
          error: "unsupported_grant_type",
          error_description: `Unsupported grant_type ${request.body.grant_type}`,
        }
      };
    }
    if (request.body.client_id !== config.auth.provider.acceptedClientId) {
      return {
        validationError: {
          error: "invalid_client",
          error_description: "Invalid client"
        }
      };
    }

    let payload;
    let codeChallenge;
    try {
      const {p, cc} = await verifySignedJwt(request.body.code);
      payload = p;
      codeChallenge = cc;
    } catch (e) {
      return {
        validationError: {
          error: "invalid_grant",
          error_description: "Invalid code",
        },
      };
    }

    if (!verifyPKCEPair(request.body.code_verifier, codeChallenge)) {
      return {
        validationError: {
          error: "invalid_grant",
          error_description: "Invalid code",
        },
      };
    }

    return {
      codePayload: payload,
    };
  },

  createAccessToken: async (payload) => {
    return createSignedJwt(payload, "24 h");
  },

  verifyAccessToken: async (token) => {
    return verifySignedJwt(token);
  },
};

