

const INSERT_BETS = 'INSERT INTO bets (user_id, draw_id, amount, bets_json, bet_time, create_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING bet_id';
async function insertBets(pool, userId, drawId, betAmount, json, betTime) {
    const result = await pool.query(INSERT_BETS, [userId, drawId, betAmount, json, betTime, Date.now()]);
    return result.rows[0].bet_id;
}
/*JSON{
    12: 4,
    34: 6,
}*/
//const INSERT_BET_WALLET_REQ
//const INSERT_BET_WALLET_RES

const INSERT_PAYOUTS = 'insert into payouts(user_id, draw_id, payout_amount, json,payout_time,create_time) values (?,?,?,?)';

/*JSON {
    123456: {12:40, 36:50},
}*/

//const INSERT_PAYOUT_WALLET_REQ
//const INSERT_PAYOUT_WALLET_RES

//const INSERT DRAW (draw_id, game_id, start_time, end_time, create_time)
//const INSERT DRAW_PAY_TABLE (draw_id, json,create_time)
//const INSERT DRAW_RESULT(draw_id, create_time, result)

const { Pool } = require('pg');

async function checkedDbPool(connStr) {
    const pool = new Pool({
        connectionString: connStr,
        connectionTimeoutMillis: 3000,
    });
    await pool.query("select 1 as result");
    return pool;
}

module.exports = {
    checkedDbPool,
    insertBets
}

async function test() {
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/postgres';
    const pool = await checkedDbPool(CONNECTION_STRING);
    const betId = await insertBets(pool, 1, 1, 344, { a: 3, b: 4 }, 4);
    console.log(betId);
    pool.end(() => { console.log("close db pool") });
}

//test();

//TODO when pool emit error

