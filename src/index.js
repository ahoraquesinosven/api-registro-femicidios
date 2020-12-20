const Koa = require("koa");
const caseRoutes = require('./cases/routes');

const app = new Koa();

app
  .use(caseRoutes.middleware())
  .listen(8080);
