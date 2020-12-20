const Koa = require("koa");
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');


const app = new Koa();
const router = new Router();

app.use(bodyParser());
const cases = [];

router.get('/v1/cases', async (ctx) => {
  ctx.body = cases;
});


const validateCreateCase = (body) => {
    if (!body.date) {
      return false;
    }
    return true;
};


router.post('/v1/cases', async (ctx) => {
  // OK por ahora array global donde insertamos casos

  if (validateCreateCase(ctx.request.body)) {
    cases.push(ctx.request.body);
    ctx.response.status=204;
  } else {
    ctx.response.status=422;
    ctx.response.message="Missing date";
  };
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8080);
