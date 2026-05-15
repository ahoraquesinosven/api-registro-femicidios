import Knex from "knex";
import config from '../config/values.js';

const knex = new Knex({
  client: 'pg',
  connection: config.db.connectionString,
  // enable this during develoment when you want to see all queries
  // debug: true 
});

export default knex;

const unaccentedMatchExpression = (field, value) => knex.raw(
  "unaccent(:field:) ILIKE unaccent(:value)",
  {
    field,
    value: `%${value}%`,
  }
);

Knex.QueryBuilder.extend("whereUnaccentedMatch", function (field, value) {
  return this.where(unaccentedMatchExpression(field, value));
});

Knex.QueryBuilder.extend("orWhereUnaccentedMatch", function (field, value) {
  return this.orWhere(unaccentedMatchExpression(field, value));
});

Knex.QueryBuilder.extend("whereNameMatch", function (field, value) {
  const tokens = value
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && token !== "");

  if (tokens.length > 0) {
    return this.where((builder) => {
      tokens.reduce(
        (expression, token) => expression.orWhereUnaccentedMatch(field, token),
        builder,
      );
    });
  }

  return this;
});

const ALIAS_SEPARATOR = "_";

Knex.QueryBuilder.extend("toNestedObjects", async function ({rootQualifier, fields}) {
  const fieldInfo = fields.map((field) => ({
    rawExpression: field,
    alias: field.replaceAll(".", ALIAS_SEPARATOR),
  }));

  const selectExpression = Object.fromEntries(
    fieldInfo.map((field) => [field.alias, field.rawExpression])
  );

  const rows = await this.select(selectExpression);

  return rows.map((row) => fieldInfo.reduce((result, field) => {
      const [qualifier, attribute] = field.alias.split(ALIAS_SEPARATOR);
      const value = row[field.alias];

      if (qualifier === rootQualifier) {
        result[attribute] = value;
      } else {
        result[qualifier] ||= {};
        result[qualifier][attribute] = value;
      }

    return result;
  }, {}));
});
