export default {
  type: "object",
  required: [
    "id",
    "feed",
    "publishedAt",
    "title",
    "link",
    "contentSnippet",
    "isDone",
    "isIrrelevant",
    "assignedUser",
  ],
  properties: {
    id: { type: "integer" },
    feed: {
      type: "object",
      required: ["id", "name", "updatedAt"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    publishedAt: { type: "string", format: "date-time" },
    title: { type: "string" },
    link: { type: "string" },
    contentSnippet: { type: "string" },
    isDone: { type: "boolean" },
    isIrrelevant: { type: "boolean" },
    assignedUser: {
      type: ["object", "null"],
      required: ["name", "email", "pictureUrl"],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        pictureUrl: { type: "string" },
      },
    },
  },
};
