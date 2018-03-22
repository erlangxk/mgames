

const SQL_INSERT_BETS = 'INSERT INTO bets (user_id, draw_id, amount, bets_json, bet_time, create_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING bet_id';
async function insertBets(pool, userId, drawId, betAmount, json, betTime) {
    const result = await pool.query(SQL_INSERT_BETS, [userId, drawId, betAmount, json, betTime, Date.now()]);
    return result.rows[0].bet_id;
}

//draw_view
const SQL_LOAD_DRAW = 'SELECT game_name FROM draw AS d, game AS g WHERE  g.game_id = d.game_id AND draw_id = $1 AND draw_end_time>$2 AND draw_start_time<=$2';
async function loadDraw(pool, drawId, betTime) {
    const result = await pool.query(SQL_LOAD_DRAW, [drawId, betTime]);
    if (result.rows.length === 0) {
        return undefined;
    }
    return result.rows[0].game_name;
}

const SQL_INSERT_DRAW = 'INSERT INTO draw (game_id,draw_start_time,draw_end_time,extra_data,create_time) VALUES ($1,$2,$3,$4,$5) RETURNING draw_id';
async function insertDraw(pool, gameId, drawStartTime, drawEndTime, extraData) {
    const result = await pool.query(SQL_INSERT_DRAW, [gameId, drawStartTime, drawEndTime, extraData, Date.now()]);
    return result.rows[0].draw_id;
}

const SQL_LOAD_USER = 'SELECT user_id FROM users WHERE operator=$1 AND name=$2';
const SQL_INSERT_USER = 'INSERT INTO users (operator,user_name,create_time) VALUES ($1,$2,$3) RETURNING user_id';

async function selectUserOrInsert(pool, operator, name) {
    return transaction(pool, async (client) => {
        const qr = await client.query(SQL_LOAD_USER, [operator, name]);
        if (qr.rows.length === 0) {
            const ir = await client.query(SQL_INSERT_USER, [operator, name, Date.now()]);
            return ir.rows[0].user_id;
        } else {
            return qr.rows[0].user_id;
        }
    });
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
    const result = await insertDraw(pool, 1, 12, 34, {
        '12': 5,
        '13': 125,
        '14': 20,
        '15': 80,
        '16': 10,
        '23': 3,
        '24': 30,
        '25': 8,
        '26': 100,
        '34': 1000,
        '35': 4,
        '36': 175,
        '45': 250,
        '46': 60,
        '56': 500
    });
    console.log(result);
    pool.end(() => { console.log("close db pool") });
}

if (require.main === module) {
    test();
}

//TODO when pool emit error

