
const tableName= 'bets';

exports.up = function(knex, Promise) {
    return knex.schema.createTable(tableName,table =>{
        table.bigincrements('bet_id');
        table.bigInteger('bet_time');
        table.bigInteger('create_time');
        table.bigInteger('user_id');
        table.bigInteger('draw_id');
        table.json('bet_data');
        table.integer('total_bets');
        table.decimal('amount',32,2);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable(tableName);
};
