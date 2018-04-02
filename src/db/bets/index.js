const { catchDatabaseError } = require('../common');

const BetStatus = {
    CREATED: 1 << 0,
    PAY_REQ_SENT: 1 << 1,
    PAY_RES_GOT: 1 << 2,
    REWARD: 1 << 3,
    PRIZE_REQ_SENT: 1 << 4,
    PRIZE_RES_GOT: 1 << 5,
    VOID_REQ_SEND: 1 << 6,
    VOID_RES_GOT: 1 << 7,
};

const SQL_INSERT_BETS = 'INSERT INTO bets (user_id, draw_id, total_bets, amount, bet_data, bet_time, create_time, status, last_update_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING bet_id';
async function insertBets(pool, userId, drawId, totalBets, betAmount, betJson, betTime) {
    return catchDatabaseError(async () => {
        const now = Date.now();
        const result = await pool.query(SQL_INSERT_BETS, [userId, drawId, totalBets, betAmount, betJson, betTime, now, BetStatus.CREATED, now]);
        return result.rows[0].bet_id;
    });
}

const SQL_UPDATE_BET_STATUS = 'UPDATE bets SET status = status | $1, last_update_time = $2 where status & $3 = $3 and bet_id = $4';
async function updateBetStatus(client, betId, newStatus, oldStatus) {
    return catchDatabaseError(async () => {
        const result = await client.query(SQL_UPDATE_BET_STATUS, [newStatus, Date.now(), oldStatus, betId]);
        return result.rowCount;
    });
}

module.exports = {
    insertBets,
    updateBetStatus
};

if (require.main === module) {
    const { checkedDbPool } = require('../common')
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test() {
        const pool = await checkedDbPool(CONNECTION_STRING);
        const result = await updateBetStatus(pool, 1, BetStatus.PAY_REQ_SENT, BetStatus.CREATED);
        console.log(result);
        pool.end(() => { console.log("close db pool") });
    }
    test().catch(err => {
        console.error(err);
    });
}

