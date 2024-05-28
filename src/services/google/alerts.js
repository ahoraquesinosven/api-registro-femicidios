import Parser from "rss-parser";

const FEEDS = [
  "https://www.google.com/alerts/feeds/17956215404504918093/2283220507632295996",
  "https://www.google.com/alerts/feeds/17956215404504918093/8592386658198323210",
];

export function fetchAllRssFeeds() {
  const parser = new Parser();
  return Promise.all(FEEDS.map(x => parser.parseURL(x)));
}
