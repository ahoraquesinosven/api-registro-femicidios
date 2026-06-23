import knex from "../services/knex.js";
import { keysetPaginator } from "../lib/keysetPagination.js";

const feedItemsTable = () => knex("feedItems");

const feedItemsQuery = () => feedItemsTable()
  .leftJoin("users", "feedItems.assignedUserId", "users.id")
  .select({
    id: "feedItems.id",
    createdAt: "feedItems.createdAt",
    updatedAt: "feedItems.updatedAt",
    feedId: "feedItems.feedId",
    feedName: "feedItems.feedName",
    feedUpdatedAt: "feedItems.feedUpdatedAt",
    publishedAt: "feedItems.publishedAt",
    title: "feedItems.title",
    link: "feedItems.link",
    snippet: "feedItems.snippet",
    isDone: "feedItems.isDone",
    isIrrelevant: "feedItems.isIrrelevant",
    assignedUserId: "feedItems.assignedUserId",
    assignedUserName: "users.name",
    assignedUserEmail: "users.email",
    assignedUserPictureUrl: "users.pictureUrl",
  });

const applyStatusFilter = (query, status) => {
  switch (status) {
    case "backlog":
      return query
        .whereNull("assignedUserId")
        .andWhere("isDone", false);
    case "inProgress":
      return query
        .whereNotNull("assignedUserId")
        .andWhere("isDone", false);
    case "done":
      return query
        .where("isDone", true);
    default:
      return query;
  }
}

function removeHtmlTags(value) {
  return value.replace(/(<([^>]+)>)/ig, '');
}

export function extractUrlFromGoogleUrl(link) {
  const url = new URL(link);
  if (url.host === "www.google.com" && url.pathname === "/url" && url.searchParams.has("url")) {
    return url.searchParams.get("url");
  }

  return link;
}

export function feedItemFromRss(rssFeed, rssItem) {
  return {
    feedId: rssFeed.link,
    feedName: rssFeed.title,
    feedUpdatedAt: rssFeed.lastBuildDate,
    publishedAt: rssItem.pubDate,
    feedItemKey: rssItem.id,
    title: removeHtmlTags(rssItem.title),
    link: extractUrlFromGoogleUrl(rssItem.link),
    snippet: rssItem.contentSnippet,
  };
}

export async function insertNewFeedItems(feedItems) {
  if (feedItems.length === 0) {
    return;
  }

  await feedItemsTable()
    .insert(feedItems)
    .onConflict().ignore();
}

const feedItemPaginators = {
  backlog: keysetPaginator([
    { name: "publishedAt", column: "feedItems.publishedAt", direction: "asc", type: "datetime" },
  ]),
};
const defaultFeedItemPaginator = keysetPaginator([
  { name: "updatedAt", column: "feedItems.updatedAt", direction: "desc", type: "datetime" },
]);

export async function fetchFeedItems({ status, limit, start }) {
  const paginator = feedItemPaginators[status] || defaultFeedItemPaginator;

  let baseQuery = paginator.applyOrder(feedItemsQuery());

  if (limit) {
    baseQuery.limit(limit);
  }

  if (start) {
    baseQuery = paginator.applyCursor(baseQuery, paginator.decode(start));
  }

  const records = await applyStatusFilter(baseQuery, status);

  return {
    result: records,
    cursor: records.length > 0 ? paginator.encode(records[records.length - 1]) : null,
  };
}

export async function countFeedItems(status) {
  const baseQuery = feedItemsTable()
    .count({count: "id"});

  const result = await applyStatusFilter(baseQuery, status)
    .first();

  return result.count;
}

export function assignFeedItem(id, userId) {
  return feedItemsTable()
    .update({assignedUserId: userId, updatedAt: new Date()}, ["id"])
    .where({id});
}

export function unassignFeedItem(id) {
  return feedItemsTable()
    .update({assignedUserId: null, updatedAt: new Date()}, ["id"])
    .where({id});
}

export function completeFeedItem(id, assignedUserId) {
  return feedItemsTable()
    .update({isDone: true, updatedAt: new Date()}, ["id"])
    .where({id, assignedUserId});
}

export function uncompleteFeedItem(id, assignedUserId) {
  return feedItemsTable()
    .update({isDone: false, updatedAt: new Date()}, ["id"])
    .where({id, assignedUserId});
}

export function markIrrelevantFeedItem(id, userId) {
  return feedItemsTable()
    .update({isDone:true, isIrrelevant: true, assignedUserId: userId, updatedAt: new Date()}, ["id"])
    .where({id});
}

export function unmarkIrrelevantFeedItem(id) {
  return feedItemsTable()
    .update({isDone: false, isIrrelevant: false, assignedUserId: null, updatedAt: new Date()}, ["id"])
    .where({id});
}
