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
        // A "date" key must round-trip as YYYY-MM-DD so the cursor passes its
        // own decode validator; toISOString() would emit a full datetime.
        if (k.type === "date" && v instanceof Date) {
          return v.toISOString().slice(0, 10);
        }
        return v instanceof Date ? v.toISOString() : v;
      });
      return Buffer.from(JSON.stringify(payload)).toString("base64url");
    },

    decode(token) {
      if (!token) {
        return null;
      }

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
      if (!values) {
        return query;
      }

      const terms = keys.map((key, i) => ({
        column: key.column,
        operator: operatorFor(key.direction),
        value: values[i],
      }));

      return query.where((outerBuilder) =>
        terms.reduce(
          ({ builder, priorTerms }, term) => ({
            builder: builder.orWhere((clause) =>
              priorTerms
                .reduce(
                  (equalities, prior) => equalities.where(prior.column, prior.value),
                  clause,
                )
                .where(term.column, term.operator, term.value),
            ),
            priorTerms: [...priorTerms, term],
          }),
          { builder: outerBuilder, priorTerms: [] },
        ).builder,
      );
    },

    applyOrder(query) {
      return keys.reduce(
        (orderedQuery, key) => orderedQuery.orderBy(key.column, key.direction),
        query,
      );
    },
  };
}
