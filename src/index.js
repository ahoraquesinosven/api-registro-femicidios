const Koa = require("koa");

const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/gigi', async (ctx) => {
  ctx.body = "Genia";
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8080);
