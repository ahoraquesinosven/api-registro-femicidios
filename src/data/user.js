import knex from "../services/knex.js";

const usersTable = () => knex("users");

export async function upsertUser(user) {
  const upsertedUsers = await usersTable()
    .insert({
      ...user,
      updatedAt: new Date()
    }, [knex.raw("*")])
    .onConflict(["provider", "providerId"]).merge();

  return upsertedUsers[0];
}
