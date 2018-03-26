module.exports = {
    client: 'pg',
    connection: {
      database: 'mgames',
      user:     'postgres',
      password: '111111'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
};
