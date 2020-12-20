const Router = require("koa-joi-router");
const Joi = Router.Joi;

const router = new Router();

const cases = [];

router.route({ 
  method: "get",
  path: '/v1/cases', 
  handler: async (ctx) => {
    ctx.body = cases;
  }
});

router.route({
  method: "post",
  path: "/v1/cases",
  validate: {
    type: 'json',
    failure: 422,
    body: Joi.object({
      date: Joi.date()
        .iso()
        .required()
    }),
  },
  handler: async (ctx) => {
    cases.push(ctx.request.body);
    ctx.response.status=204;
  },
});

module.exports = router;
