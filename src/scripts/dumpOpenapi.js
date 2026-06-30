#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
// Importing the routers runs the operation() calls whose side effect populates
// openApiDocument.paths. Without this import the document would have no paths.
import "../routers/index.js";
import { openApiDocument } from "../openapi/document.js";

// The OpenAPI document is assembled at runtime from the route operations, so it
// only exists once the modules are imported. Dump it to a file so external
// tooling (e.g. redocly lint) can read it.
const path = process.argv[2] || "openapi.json";
await writeFile(path, JSON.stringify(openApiDocument, null, 2));
console.log(`wrote ${path}`);
