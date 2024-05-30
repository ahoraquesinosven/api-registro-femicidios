import knex from "../services/knex.js";

const feedItemsTable = () => knex("feed_items");

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

export function fetchFeedItems() {
  return feedItemsTable().select();
}

