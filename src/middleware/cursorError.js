import { CursorError } from "../lib/keysetPagination.js";

export function handleCursorErrors() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (e instanceof CursorError) {
        ctx.status = 400;
        ctx.body = { message: "Invalid cursor" };
        return;
      }
      throw e;
    }
  };
}
