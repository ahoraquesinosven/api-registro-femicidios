import {knex} from "./db.js";

// Inserts a single feed item directly (bypasses the RSS ingestion path). Pass
// overrides to set status-relevant columns (assignedUserId, isDone, isIrrelevant).
export const seedFeedItem = async (overrides = {}) => {
  const [row] = await knex("feedItems").insert(
    {
      feedId: "https://feed.example/rss",
      feedName: "Example Feed",
      feedUpdatedAt: new Date("2025-01-01T00:00:00Z"),
      publishedAt: new Date("2025-01-01T00:00:00Z"),
      feedItemKey: "item-1",
      title: "Some title",
      link: "https://news.example/article-1",
      snippet: "A short content snippet",
      ...overrides,
    },
    ["id"],
  );
  return row.id;
};

// Seeds `count` distinct backlog items with strictly increasing publishedAt so
// the backlog paginator (publishedAt asc) has a deterministic, gap-free order.
// feedItemKey/link are unique per row to satisfy the table's conflict handling.
export const seedFeedItems = (count, overrides = {}) =>
  Promise.all(
    Array.from({length: count}, (_, i) =>
      seedFeedItem({
        feedItemKey: `item-${i + 1}`,
        link: `https://news.example/article-${i + 1}`,
        publishedAt: new Date(Date.UTC(2025, 0, i + 1)),
        ...overrides,
      }),
    ),
  );
