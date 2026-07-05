// OpenAPI 3.1 can't parametrize a $ref, so this factory stamps out a concrete
// paginated-envelope schema per resource. Pass the (usually $ref'd) item schema
// for `page`; register the result as a named schema in schemas.js.
export const paginatedEnvelope = (itemsSchema) => ({
  type: "object",
  required: ["limit", "total", "start", "next", "page"],
  properties: {
    limit: { type: "integer" },
    total: { type: "integer" },
    start: { type: ["string", "null"] },
    next: { type: ["string", "null"] },
    page: { type: "array", items: itemsSchema },
  },
});
