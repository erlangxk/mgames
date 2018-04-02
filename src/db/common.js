const { Pool } = require('pg');

async function checkedDbPool(connStr) {
    const pool = new Pool({
        connectionString: connStr,
        connectionTimeoutMillis: 3000,
    });
    await pool.query("select 1 as result");
    return pool;
}

async function transaction(pool, func) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await func(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

const { MyError, ErrorCode } = require('../errors');

async function catchDatabaseError(func) {
    try {
        return await func();
    } catch (err) {
        throw new MyError(ErrorCode.ERR_DB, err);
    }
}

module.exports = {
    transaction,
    checkedDbPool,
    catchDatabaseError,
}
