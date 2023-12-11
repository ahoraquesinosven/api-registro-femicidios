import Router from "@koa/router";
import victim_controller from "../controllers/victims.js";

const router = new Router({
  prfix: '/v1/victims'
})

// List
router.get(
  "/",
  async (ctx) => {
    try {
      const result = await victim_controller.victim_list();
      ctx.response.body = result;
    } catch (error) {
      console.error(error);	
    }
  }
)

// Get by name
router.get(
  "/:name",
  async (ctx) => {
    const {name} = ctx.request.query;
    try {
      const result = await victim_controller.victim_get_by_name(name);
      ctx.response.body = result;
    } catch (error) {
      console.error(error);
    }
  }
)

// Create Victim
router.post(
  "/",
  async (ctx) => {
    ctx.body = JSON.stringify(ctx.request.body);
    try {	
      const result = await victim_controller.victim_create(ctx.body);
      result ? ctx.response.body = "200" : ctx.response.body = "501";
    } catch (error) {
      console.error(error);
    }
  }
)

// Delete Victim
router.delete(
  "/:name",
  async (ctx) => {
    const {name} = ctx.request.query;
    try {
      const result = await victim_controller.victim_get_by_name(name);
      ctx.response.body = result;
      const id = victim_controller.victim_get_id_by_name(name);
      victim_controller.victim_delete(id);
    } catch (error) {
      console.error(error);	
    }
  }
)

// Update Victim
// lore ipsum blablabla blablabla

export default router;
