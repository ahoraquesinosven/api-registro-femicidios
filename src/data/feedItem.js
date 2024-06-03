import knex from "../services/knex.js";

const feedItemsTable = () => knex("feed_items");

const feedItemsQuery = () => feedItemsTable()
  .leftJoin("users", "feed_items.assignedUserId", "users.id")
  .select({
    id: "feed_items.id",
    feedId: "feed_items.feedId",
    feedName: "feed_items.feedName",
    feedUpdatedAt: "feed_items.feedUpdatedAt",
    publishedAt: "feed_items.publishedAt",
    title: "feed_items.title",
    link: "feed_items.link",
    isDone: "feed_items.isDone",
    assignedUserId: "feed_items.assignedUserId",
    assignedUserName: "users.name",
    assignedUserEmail: "users.email",
    assignedUserPictureUrl: "users.pictureUrl",
  });

function removeHtmlTags(value) {
  return value.replace(/(<([^>]+)>)/ig, '');
}

export function feedItemFromRss(rssFeed, rssItem) {
  return {
    feedId: rssFeed.link,
    feedName: rssFeed.title,
    feedUpdatedAt: rssFeed.lastBuildDate,
    publishedAt: rssItem.pubDate,
    feedItemKey: rssItem.id,
    title: removeHtmlTags(rssItem.title),
    link: rssItem.link
  };
}

export async function insertNewFeedItems(feedItems) {
  if (feedItems.length === 0) {
    return;
  }

  await feedItemsTable()
    .insert(feedItems)
    .onConflict("feedItemKey").ignore();
}

export function fetchFeedItems(status) {
  let query = feedItemsQuery()
    .orderBy("feed_items.publishedAt", "asc");

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

