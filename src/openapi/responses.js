export default {
  ValidationErrorResponse: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
            required: [ "type", "path", "message" ],

            properties: {
              type: { type: "string", enum: [ "parameter", "body" ] },
              path: { type: "string", },
              message: { type: "string", },
            },
          }
        },
      },
    },
  }
}
