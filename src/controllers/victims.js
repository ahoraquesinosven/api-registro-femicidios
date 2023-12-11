import knex from "../services/knex.js";

// Create Victim
exports.victim_create = ({data}) => knex('victims').insert(data); 

// List Victims
exports.victim_list = () => knex.select().from("victims");

// Get Victim by name
exports.victim_get_by_name = ( name ) => knex.select().from("victims").where({"victim_name_lastname": name});

// Get ID by name
exports.victim_get_id_by_name = (name) => {
  const victim = victim_get_by_name(name);
  const victim_id = knex.select("id").from("victims").where({"victim_name_lastname": victim.name});
  return victim_id;
}
// Update
// WIP
exports.victim_patch = (prop) =>{};

// Delete by ID
exports.victim_delete = (id) =>  knex.from("victims").where({"victim_id": id}).del(); 
