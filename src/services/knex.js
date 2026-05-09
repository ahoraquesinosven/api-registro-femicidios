import Knex from "knex";
import config from '../config/values.js';

export default new Knex({
  client: 'pg',
  connection: config.db.connectionString,
  //debug:true enable this during develoment when you want to see all queries
});

export class NestedObjectsQuery {
  static ALIAS_SEPARATOR = "_"

  constructor({baseQuery, rootQualifier, fields}) {
    this.baseQuery = baseQuery;

    this.fields = fields.map((field) => ({
      rawExpression: field,
      alias: field.replaceAll(".", NestedObjectsQuery.ALIAS_SEPARATOR),
    }));

    this.rootQualifier = rootQualifier;
  }

  selectExpression() {
    return Object.fromEntries(
      this.fields.map((field) => [field.alias, field.rawExpression])
    );
  }

  toNestedObjects(row) {
    const result = {};
    for (const field of this.fields) {
      const [qualifier, attribute] = field.alias.split(NestedObjectsQuery.ALIAS_SEPARATOR);
      const value = row[field.alias];

      if (qualifier === this.rootQualifier) {
        result[attribute] = value;
      } else {
        result[qualifier] ||= {};
        result[qualifier][attribute] = value;
      }
    }
    return result;
  }

  async select() {
    const rows = await this.baseQuery.select(this.selectExpression());
    return rows.map((row) => this.toNestedObjects(row));
  }
}
