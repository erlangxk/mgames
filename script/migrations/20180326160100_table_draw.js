
const tableName= 'draws';

exports.up = function(knex, Promise) {
    return knex.schema.createTable(tableName,table =>{
        table.bigincrements('draw_id');
        table.bigInteger('draw_create_time').notNullable();
        table.integer('game_id').notNullable();
        table.bigInteger('bet_start_time').notNullable();
        table.bigInteger('bet_end_time').notNullable();
        table.json('data');
        table.json('result');
        table.bigInteger('result_create_time');
        table.foreign('game_id').references('games.game_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable(tableName);
};
