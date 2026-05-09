import {fetchAllRssFeeds} from "../services/google/alerts.js";
import {feedItemFromRss, insertNewFeedItems, fetchFeedItems, assignFeedItem, unassignFeedItem, completeFeedItem, uncompleteFeedItem, countFeedItems, markIrrelevantFeedItem, unmarkIrrelevantFeedItem} from "../data/feedItem.js";
import {OpenApiRouter} from "../openapi/index.js";
import {securitySchemes} from "../openapi/securitySchemes.js";

const router = new OpenApiRouter({
  prefix: "/v1/feed",
});

router.operation({
  method: "post", relativePath: "/refresh", spec: {
    tags: ["feed"],
    summary: "Refreshes the feeds by connecting to our feed sources",
    security: [securitySchemes.internal],
    responses: {
      "204": {
        description: "Successful response",
      },
    },
  },
  handlers: [async (ctx) => {
    const feeds = await fetchAllRssFeeds();
    for (const feed of feeds) {
      const feedItems = feed.items.map(item => feedItemFromRss(feed, item));
      await insertNewFeedItems(feedItems);
    }

    ctx.status = 204;
  }],
});

router.operation({
  method: "get", relativePath: "/items", spec: {
    tags: ["feed"],
    summary: "Retrieves the full list of feed items",
    security: [securitySchemes.internal, securitySchemes.oauth],
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
      {
        name: "limit",
        in: "query",
        description: "Maximum amount of results to return",
        schema: {
          type: "integer",
          minimum: 0,
        }
      },
      {
        name: "start",
        in: "query",
        description: "Cursor as returned on the `next` property of a previous request to this endpoint",
        schema: {
          type: "string",
        }
      },
    ],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  },
  handlers: [async (ctx) => {
    const {status, limit, start} = ctx.request.query;

    const [items, count] = await Promise.all([
      fetchFeedItems({status, limit, start}),
      countFeedItems(status),
    ]);

    ctx.body = {
      limit: parseInt(limit),
      total: parseInt(count),
      start,
      next: items.cursor,
      page: items.result.map(x => ({
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
        isIrrelevant: x.isIrrelevant,
        assignedUser: x.assignedUserId ? {
          name: x.assignedUserName,
          email: x.assignedUserEmail,
          pictureUrl: x.assignedUserPictureUrl,
        } : null,
      }))
    };
  }],
});

const transitionOperations = [
  {
    method: "post",
    relativePath: "/items/{feedItemId}/assignment",
    description: "Assigns a given feed item to the current user",
    updateFunction: (feedItemId, userId) => assignFeedItem(feedItemId, userId),
  },
  {
    method: "delete",
    relativePath: "/items/{feedItemId}/assignment",
    description: "Removes the assigned user for a given feed item",
    updateFunction: (feedItemId) => unassignFeedItem(feedItemId),
  },
  {
    method: "post",
    relativePath: "/items/{feedItemId}/completion",
    description: "Marks a single feed item that is assigned to the current user as done",
    updateFunction: (feedItemId, userId) => completeFeedItem(feedItemId, userId),
  },
  {
    method: "delete",
    relativePath: "/items/{feedItemId}/completion",
    description: "Marks a single feed item that is assigned to the current user as in progress",
    updateFunction: (feedItemId, userId) => uncompleteFeedItem(feedItemId, userId),
  },
  {
    method: "post",
    relativePath: "/items/{feedItemId}/irrelevant",
    description: "Mark a single feed item as irrelevant and assign to current user",
    updateFunction: (feedItemId, userId) => markIrrelevantFeedItem(feedItemId, userId),
  },
  {
    method: "delete",
    relativePath: "/items/{feedItemId}/irrelevant",
    description: "Removes the flag irrelevant for a given feed item",
    updateFunction: (feedItemId) => unmarkIrrelevantFeedItem(feedItemId),
  },
]

for (const op of transitionOperations) {
  router.operation({
    method: op.method, relativePath: op.relativePath, spec: {
      tags: ["feed"],
      summary: op.description,
      security: [securitySchemes.oauth],
      parameters: [
        {
          name: "feedItemId",
          in: "path",
          description: "Feed item to update",
          required: true,
          schema: {
            type: "integer",
          },
        },
      ],
      responses: {
        "204": {
          description: "Successful response",
        },
      },
    },
    handlers: [async (ctx) => {
      const updatedFeedItems = await op.updateFunction(
        ctx.params.feedItemId,
        ctx.state.auth.id
      );

      if (updatedFeedItems.length === 0) {
        ctx.status = 422;
        return;
      }

      ctx.status = 204;
    }],
  });
}

export default router.nativeRouter;
