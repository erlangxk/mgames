const tableName= 'users';

exports.up = function(knex, Promise) {
    return knex.schema.createTable(tableName,table =>{
        table.bigIncrements('user_id');
        table.string('operator_id',32);
        table.string('username',64);
        table.bigInteger('create_time');
        table.unique(['operator_id','username']);
    });
  };
  
  exports.down = function(knex, Promise) {
      return knex.schema.dropTable(tableName);
  };
  