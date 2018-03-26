const tableName= 'wallet_bet';

exports.up = function(knex, Promise) {
    return knex.schema.createTable(tableName,table =>{
        table.bigincrements('game_trx_id');
        table.bigInteger('bet_id');
        table.bigInteger('create_time');
        table.decimal('amount',32,2);
        table.string('wallet_trx_id',128);
        table.string('wallet_return_code',64);
        table.bigInteger('last_update_time');
        table.integer('error').defaultTo(0);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable(tableName);
};