import {fetchAllRssFeeds} from "../services/google/alerts.js";
import {feedItemFromRss, insertNewFeedItems, fetchFeedItems, assignFeedItem, unassignFeedItem, completeFeedItem, uncompleteFeedItem} from "../data/feedItem.js";
import {requireServerAuth, requireUserAuth} from "../middleware/auth.js";
import {OpenApiRouter} from "../openapi.js";

const router = new OpenApiRouter({
  prefix: "/v1/feed",
});

router.operation({
  relativePath: "/refresh",
  method: "post",
  spec: {
    tags: ["feed"],
    summary: "Refreshes the feeds by connecting to our feed sources",
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
    security: [{"oauth": []}],
    parameters: [
      {
        name: "status",
        in: "query",
        description: "Filter results to only contain feed items in the given status",
        schema: {
          type: "string",
          enum: ["backlog", "inProgress", "done"],
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const items = await fetchFeedItems(ctx.request.query.status);

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
      isDone: x.isDone,
      assignedUser: x.assignedUserId ? {
        name: x.assignedUserName,
        email: x.assignedUserEmail,
        pictureUrl: x.assignedUserPictureUrl,
      } : null,
    }));

    ctx.body = result;
  }],
});

router.operation({
  relativePath: "/items/{feedItemId}/assignment",
  method: "post",
  spec: {
    tags: ["feed"],
    summary: "Assigns a given feed item to the current user",
    security: [{"oauth": []}],
    parameters: [
      {
        name: "feedItemId",
        in: "path",
        description: "Feed item to assign to the current user",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const updatedFeedItems = await assignFeedItem(
      ctx.params.feedItemId,
      ctx.state.token.id
    );

    if (updatedFeedItems.length === 0) {
      ctx.status = 422;
      return;
    }

    ctx.status = 200;

  }],
});

router.operation({
  relativePath: "/items/{feedItemId}/assignment",
  method: "delete",
  spec: {
    tags: ["feed"],
    summary: "Removes the assigned user for a given feed item",
    security: [{"oauth": []}],
    parameters: [
      {
        name: "feedItemId",
        in: "path",
        description: "Feed item to unassign",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const updatedFeedItems = await unassignFeedItem(
      ctx.params.feedItemId,
    );

    if (updatedFeedItems.length === 0) {
      ctx.status = 422;
      return;
    }

    ctx.status = 200;

  }],
});


router.operation({
  relativePath: "/items/{feedItemId}/completion",
  method: "post",
  spec: {
    tags: ["feed"],
    summary: "Marks a single feed item that is assigned to the current user as done",
    security: [{"oauth": []}],
    parameters: [
      {
        name: "feedItemId",
        in: "path",
        description: "Feed item to mark as done",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const updatedFeedItems = await completeFeedItem(
      ctx.params.feedItemId,
      ctx.state.token.id
    );

    if (updatedFeedItems.length === 0) {
      ctx.status = 422;
      return;
    }

    ctx.status = 200;

  }],
});

router.operation({
  relativePath: "/items/{feedItemId}/completion",
  method: "delete",
  spec: {
    tags: ["feed"],
    summary: "Marks a single feed item that is assigned to the current user as in progress",
    security: [{"oauth": []}],
    parameters: [
      {
        name: "feedItemId",
        in: "path",
        description: "Feed item to mark as in progress",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [requireUserAuth, async (ctx) => {
    const updatedFeedItems = await uncompleteFeedItem(
      ctx.params.feedItemId,
      ctx.state.token.id
    );

    if (updatedFeedItems.length === 0) {
      ctx.status = 422;
      return;
    }

    ctx.status = 200;

  }],
});

export default router.nativeRouter;
