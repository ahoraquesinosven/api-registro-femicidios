import app from "../../../src/app.js";

let server;
let baseUrl;

export async function startTestServer() {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const {port} = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
  return baseUrl;
}

export async function stopTestServer() {
  if (!server) {
    return;
  }
  await new Promise((resolve) => server.close(resolve));
  server = undefined;
}

// Thin fetch wrapper: prefixes the base URL and JSON-encodes the body.
// Returns the raw Response — tests call .status / await .json() themselves.
export function api(path, {method = "GET", headers = {}, body} = {}) {
  const opts = {method, headers: {...headers}};
  if (body !== undefined) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  return fetch(`${baseUrl}${path}`, opts);
}
