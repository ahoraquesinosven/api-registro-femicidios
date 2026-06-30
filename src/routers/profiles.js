import { OpenApiRouter } from "../openapi/index.js";
import { securitySchemes } from "../openapi/securitySchemes.js";

const router = new OpenApiRouter({
  prefix: "/v1/profiles",
});

router.operation({
  method: "get",
  relativePath: "/me",
  spec: {
    tags: ["auth"],
    operationId: "getCurrentUserProfile",
    summary: "Retrieves the current user profile",
    security: [securitySchemes.oauth],
    responses: {
      200: {
        description: "Current user profile retrieved successfully",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserProfile" },
          },
        },
      },
      401: { $ref: "#/components/responses/UnauthorizedResponse" },
    },
  },
  handlers: [
    async (ctx) => {
      ctx.body = {
        name: ctx.state.auth.name,
        pictureUrl: ctx.state.auth.picture,
      };
    },
  ],
});

export default router.nativeRouter;
