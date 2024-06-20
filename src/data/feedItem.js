import knex from "../services/knex.js";

const feedItemsTable = () => knex("feedItems");

const feedItemsQuery = () => feedItemsTable()
  .leftJoin("users", "feedItems.assignedUserId", "users.id")
  .select({
    id: "feedItems.id",
    feedId: "feedItems.feedId",
    feedName: "feedItems.feedName",
    feedUpdatedAt: "feedItems.feedUpdatedAt",
    publishedAt: "feedItems.publishedAt",
    title: "feedItems.title",
    link: "feedItems.link",
    isDone: "feedItems.isDone",
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

export function fetchFeedItems({ status, limit, start }) {
  const baseQuery = feedItemsQuery()
    .orderBy("feedItems.publishedAt", "asc");

  if (limit) {
    baseQuery.limit(limit);
  }

  if (start) {
    baseQuery.where("feedItems.publishedAt", ">", start);
  }

  return applyStatusFilter(baseQuery, status);
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
    .update({assignedUserId: userId}, ["id"])
    .where({id});
}

export function unassignFeedItem(id) {
  return feedItemsTable()
    .update({assignedUserId: null}, ["id"])
    .where({id});
}

export function completeFeedItem(id, assignedUserId) {
  return feedItemsTable()
    .update({isDone: true}, ["id"])
    .where({id, assignedUserId});
}

export function uncompleteFeedItem(id, assignedUserId) {
  return feedItemsTable()
    .update({isDone: false}, ["id"])
    .where({id, assignedUserId});
}

