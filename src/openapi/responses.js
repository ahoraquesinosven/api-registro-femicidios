export default {
  ValidationErrorResponse: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "path", "message"],

            properties: {
              type: { type: "string", enum: ["parameter", "body"] },
              path: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },

  ValidationErrorNotFound: {
    description: "Not found",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "path", "message"],

            properties: {
              type: { type: "string", enum: ["parameter", "body"] },
              path: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },

  InvalidCursorResponse: {
    description: "Invalid cursor",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },

  UnauthorizedResponse: {
    description: "Missing or invalid authentication credentials",
  },
};
