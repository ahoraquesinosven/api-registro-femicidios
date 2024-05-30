import Router from "@koa/router";
import {fetchAllRssFeeds} from "../services/google/alerts.js";
import {feedItemFromRss, insertNewFeedItems, fetchFeedItems} from "../data/feedItem.js";
import {requireServerAuth, requireUserAuth} from "../middleware/auth.js";
import {OpenApiRouter} from "../openapi.js";

const router = new OpenApiRouter(new Router({
  prefix: "/v1/feed",
}));

router.operation({
  relativePath: "/refresh",
  method: "post",
  spec: {
    tags: ["feed"],
    summary: "Refreshes the feeds by connecting to our feed sources",
    operationId: "v1FeedRefresh",
    security: [{"internal": []}],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireServerAuth, async (ctx) => {
    const feeds = await fetchAllRssFeeds();
    for (const feed of feeds) {
      const feedItems = feed.items.map(item => feedItemFromRss(feed, item));
      await insertNewFeedItems(feedItems);
    }

    ctx.status = 200;
  }],
});

router.operation({
  relativePath: "/items",
  method: "get",
  spec: {
    tags: ["feed"],
    summary: "Retrieves the full list of feed items",
    operationId: "v1FeedItems",
    security: [{"oauth": []}],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const items = await fetchFeedItems();

    const result = items.map(x => ({
      id: x.id,
      feed: {
        id: x.feedId,
        name: x.feedName,
        updatedAt: x.feedUpdatedAt,
      },
      publishedAt: x.publishedAt,
      title: x.title,
      link: x.link,
    }));

    ctx.body = result;
  }],
});

export default router.nativeRouter;
