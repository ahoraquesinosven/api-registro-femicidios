import Router from "@koa/router";
import {fetchAllRssFeeds} from "../services/google/alerts.js";
import {feedItemFromRss, insertNewFeedItems, fetchFeedItems} from "../data/feedItem.js";

const router = new Router({
  prefix: "/v1/feed",
});

router.post("/refresh", async (ctx) => {
  const feeds = await fetchAllRssFeeds();
  for (const feed of feeds) {
    const feedItems = feed.items.map(item => feedItemFromRss(feed, item));
    await insertNewFeedItems(feedItems);
  }

  ctx.status = 200;
});

router.get("/items", async (ctx) => {
  const items = await fetchFeedItems();

  ctx.body = items;
});

export default router;
