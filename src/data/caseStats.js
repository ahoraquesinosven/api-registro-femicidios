// Pure aggregations over the rows fetched by GET /v1/cases/stats.

// Ascending, nulls last, false < true: the order Postgres used for the
// SQL version's tie-break.
const compareValues = (a, b) => {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
};

// Counts rows per distinct combination of `keys`, by count desc, then by
// each key asc. The string key only tells groups apart (safe: grouped columns
// are enums, booleans or null); values come from each group's first row.
export const countBy = (rows, ...keys) =>
  Object.values(
    Object.groupBy(rows, (row) => keys.map((key) => `${row[key]}`).join("|")),
  )
    .map((group) => ({
      ...Object.fromEntries(keys.map((key) => [key, group[0][key]])),
      count: group.length,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        keys.reduce((cmp, key) => cmp || compareValues(a[key], b[key]), 0),
    );

// Counts of a nullable boolean field: true / false / unset.
export const booleanBreakdown = (rows, key) => ({
  yes: rows.filter((row) => row[key] === true).length,
  no: rows.filter((row) => row[key] === false).length,
  unknown: rows.filter((row) => row[key] === null).length,
});
