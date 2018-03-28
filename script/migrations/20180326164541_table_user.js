const tableName= 'users';

exports.up = function(knex, Promise) {
    return knex.schema.createTable(tableName,table =>{
        table.bigIncrements('user_id');
        table.string('operator_id',32).notNullable();
        table.string('username',64).notNullable() ;
        table.string('currency',3).notNullable();
        table.boolean('test').notNullable().defaultTo(false);
        table.bigInteger('create_time').notNullable();
        table.unique(['operator_id','username']);
    });
  };
  
  exports.down = function(knex, Promise) {
      return knex.schema.dropTable(tableName);
  };
  