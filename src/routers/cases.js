import Router from "@koa/router";
import knex from "../services/knex.js";

const router = new Router({
  prefix: '/v1/cases',
});

router.get(
  "/",
  async (ctx) => {
    const result = await knex.select().from("cases");
    ctx.body = result;
  }
);

export default router;
