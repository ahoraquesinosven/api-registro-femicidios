import Ajv2019 from "ajv/dist/2019.js";
import addFormats from "ajv-formats";
import schemas from "../../../src/openapi/schemas.js";
import {openApiDocument} from "../../../src/openapi/document.js";
// Registering the routers populates openApiDocument.paths as a side effect.
// The server runs in a separate container now, so the test process must trigger
// this itself rather than relying on importing the app.
import "../../../src/routers/index.js";

// Mirrors the request-validation setup in src/openapi/validations.js so response
// conformance is checked the same way the app validates requests. Injecting
// `components: { schemas }` lets `$ref: "#/components/schemas/..."` resolve.
const ajv = new Ajv2019({allErrors: true, strict: false});
addFormats(ajv);

function responseSchema(method, path, status) {
  const operation = openApiDocument.paths[path]?.[method.toLowerCase()];
  if (!operation) {
    throw new Error(`No OpenAPI operation documented for ${method} ${path}`);
  }

  let response = operation.responses?.[String(status)];
  if (!response) {
    throw new Error(`No ${status} response documented for ${method} ${path}`);
  }

  if (response.$ref) {
    const name = response.$ref.replace("#/components/responses/", "");
    response = openApiDocument.components.responses[name];
  }

  return response.content?.["application/json"]?.schema;
}

// Asserts a response body conforms to the schema declared for that
// operation/status in the OpenAPI document. No-op when no body is documented
// (e.g. 201/204). Throws with the AJV errors when it doesn't match.
export function assertConformsToSpec(method, path, status, body) {
  const schema = responseSchema(method, path, status);
  if (!schema) {
    return;
  }

  const valid = ajv.validate({...schema, components: {schemas}}, body);
  if (!valid) {
    throw new Error(
      `Response ${method} ${path} -> ${status} does not conform to the OpenAPI spec:\n` +
        JSON.stringify(ajv.errors, null, 2),
    );
  }
}
