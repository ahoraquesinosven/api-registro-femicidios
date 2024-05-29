import Router from "@koa/router";
import {fetchAllRssFeeds} from "../services/google/alerts.js";
import {feedItemFromRss, insertNewFeedItems, fetchFeedItems} from "../data/feedItem.js";
import { requireServerAuth, requireUserAuth } from "../middleware/auth.js";
import OpenApiDocument from "../openapi.js";

const router = new Router({
  prefix: "/v1/feed",
});

OpenApiDocument.registerOperation("/v1/feed/refresh", "post", {
  tags: ["feed"],
  summary: "Refreshes the feeds by connecting to our feed sources",
  security: [{ "internal": [] }],
  responses: {
    "200": {
      description: "Successful response",
    },
  },
});
router.post("/refresh", requireServerAuth, async (ctx) => {
  const feeds = await fetchAllRssFeeds();
  for (const feed of feeds) {
    const feedItems = feed.items.map(item => feedItemFromRss(feed, item));
    await insertNewFeedItems(feedItems);
  }

  ctx.status = 200;
});

OpenApiDocument.registerOperation("/v1/feed/items", "get", {
  tags: ["feed"],
  summary: "Retrieves the full list of feed items",
  security: [{ "oauth": [] }],
  responses: {
    "200": {
      description: "Successful response",
    },
  },
});
router.get("/items", requireUserAuth, async (ctx) => {
  const items = await fetchFeedItems();

  ctx.body = items;
});

export default router;
