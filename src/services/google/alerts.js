import Parser from "rss-parser";

const FEEDS = [
  "https://www.google.com/alerts/feeds/17956215404504918093/2283220507632295996",
  "https://www.google.com/alerts/feeds/17956215404504918093/8592386658198323210",
  "https://www.google.com/alerts/feeds/17956215404504918093/3431860141378302908",
  "https://www.google.com/alerts/feeds/17956215404504918093/10147651298585045566",
  "https://www.google.com/alerts/feeds/17956215404504918093/10511338797799850206",
  "https://www.google.com/alerts/feeds/17956215404504918093/9064292191221581703",
  "https://www.google.com/alerts/feeds/17956215404504918093/9661245742074469621",
  "https://www.google.com/alerts/feeds/17956215404504918093/2647766912678910666",
  "https://www.google.com/alerts/feeds/17956215404504918093/17298621569130660034",
  "https://www.google.com/alerts/feeds/17956215404504918093/6507748586229942263",
  "https://www.google.com/alerts/feeds/17956215404504918093/13553117023073887117",
  "https://www.google.com/alerts/feeds/17956215404504918093/15486035729312377327",
  "https://www.google.com/alerts/feeds/17956215404504918093/18146615101716023116",
];

export function fetchAllRssFeeds() {
  const parser = new Parser();
  return Promise.all(FEEDS.map(x => parser.parseURL(x)));
}
