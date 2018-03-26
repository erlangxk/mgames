
exports.up = function(knex, Promise) {
  return knex.schema.createTable('games',table =>{
      table.integer('game_id').primary();
      table.string('game_name',64);
  });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('games');
};
