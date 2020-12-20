const knex = require('../services/knex');
const Router = require("koa-joi-router");

const Joi = Router.Joi;
const router = new Router();

router.route({ 
  method: "get",
  path: '/v1/cases', 
  handler: async (ctx) => {
    const result = await knex.select().from("cases");
    ctx.body = result;
  }
});

router.route({
  method: "post",
  path: "/v1/cases",
  validate: {
    type: 'json',
    failure: 422,
    body: Joi.object({
      ocurredAt: Joi.date()
        .iso()
        .required()
    }),
  },
  handler: async (ctx) => {
    await knex.insert(ctx.request.body).into("cases");
    ctx.response.status=204;
  },
});

module.exports = router;
