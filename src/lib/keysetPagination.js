export class CursorError extends Error {
  constructor() {
    super("Invalid cursor");
  }
}

const validators = {
  date: (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v),
  id: (v) => Number.isInteger(v) && v > 0,
  datetime: (v) => typeof v === "string" && !Number.isNaN(Date.parse(v)),
  string: (v) => typeof v === "string" && v.length > 0,
};

const operatorFor = (direction) => (direction === "asc" ? ">" : "<");

// Builds a keyset paginator over an ordered list of sort keys. Each key:
//   { name, column, direction, type }
//   name      - property on the result row (read when encoding a cursor)
//   column    - qualified SQL column for WHERE / ORDER BY (e.g. "case.occurredAt")
//   direction - "asc" | "desc"
//   type      - "date" | "id" | "datetime" | "string" (drives decode validation)
export function keysetPaginator(keys) {
  return {
    encode(row) {
      const payload = keys.map((k) => {
        const v = row[k.name];
        return v instanceof Date ? v.toISOString() : v;
      });
      return Buffer.from(JSON.stringify(payload)).toString("base64url");
    },

    decode(token) {
      try {
        const raw = Buffer.from(token, "base64url").toString("utf8");
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length !== keys.length) {
          throw new CursorError();
        }
        keys.forEach((k, i) => {
          const validate = validators[k.type] || validators.string;
          if (!validate(parsed[i])) throw new CursorError();
        });
        return parsed;
      } catch (e) {
        if (e instanceof CursorError) throw e;
        throw new CursorError();
      }
    },

    // Lexicographic keyset comparison: for keys [A, B] this yields
    //   (A op a) OR (A = a AND B op b)
    applyCursor(query, values) {
      return query.where((b) => {
        keys.forEach((k, i) => {
          b.orWhere((sub) => {
            for (let j = 0; j < i; j++) {
              sub.where(keys[j].column, values[j]);
            }
            sub.where(k.column, operatorFor(k.direction), values[i]);
          });
        });
      });
    },

    applyOrder(query) {
      let q = query;
      for (const k of keys) {
        q = q.orderBy(k.column, k.direction);
      }
      return q;
    },
  };
}
