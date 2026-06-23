export class CursorError extends Error {
  constructor() {
    super("Invalid cursor");
  }
}

export function encodeCursor(occurredAt, id) {
  const payload = JSON.stringify({ o: occurredAt, i: id });
  return Buffer.from(payload).toString("base64url");
}

export function decodeCursor(cursorString) {
  try {
    const raw = Buffer.from(cursorString, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.o !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parsed.o) ||
      !Number.isInteger(parsed.i) ||
      parsed.i <= 0
    ) {
      throw new CursorError();
    }
    return { occurredAt: parsed.o, id: parsed.i };
  } catch (e) {
    if (e instanceof CursorError) throw e;
    throw new CursorError();
  }
}
