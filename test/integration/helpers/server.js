// The server runs as a separate container (the `test-api` service); tests reach
// it over HTTP at TEST_TARGET_URL. Keeping it out-of-process means the server's
// logs and the test runner's output land on separate stdouts instead of
// interleaving in one process.
const baseUrl = process.env.TEST_TARGET_URL;
if (!baseUrl) {
  throw new Error(
    "TEST_TARGET_URL is required (set by the test-api service in compose.yml)",
  );
}

// Thin fetch wrapper: prefixes the base URL and JSON-encodes the body.
// Returns the raw Response — tests call .status / await .json() themselves.
export function api(path, { method = "GET", headers = {}, body } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  return fetch(`${baseUrl}${path}`, opts);
}
