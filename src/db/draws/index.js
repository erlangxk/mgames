const { catchDatabaseError } = require('../common');

const SQL_LOAD_DRAW = 'SELECT game_name FROM draws AS d, games AS g WHERE  g.game_id = d.game_id AND draw_id = $1 AND bet_end_time>$2 AND bet_start_time<=$2';
async function loadDraw(pool, drawId, betTime) {
    return catchDatabaseError(async () => {
        const result = await pool.query(SQL_LOAD_DRAW, [drawId, betTime]);
        if (result.rows.length === 0) {
            return undefined;
        }
        return result.rows[0].game_name;
    });
}

const SQL_INSERT_DRAW = 'INSERT INTO draws (game_id,bet_start_time,bet_end_time,data,draw_create_time) VALUES ($1,$2,$3,$4,$5) RETURNING draw_id';
async function insertDraw(pool, gameId, betStartTime, betEndTime, drawData) {
    return catchDatabaseError(async () => {
        const result = await pool.query(SQL_INSERT_DRAW, [gameId, betStartTime, betEndTime, drawData, Date.now()]);
        return result.rows[0].draw_id;
    });
}

const SQL_UPDATE_DRAW = 'UPDATE draws SET result = $1,result_create_time=$2 WHERE draw_id=$3 AND bet_end_time<$2';
async function updateDrawResult(pool, drawId, drawResult) {
    return catchDatabaseError(async () => {
        const result = await pool.query(SQL_UPDATE_DRAW, [drawResult, Date.now(), drawId]);
        return result.rowCount;
    });
}

module.exports = {
    loadDraw,
    insertDraw,
    updateDrawResult
};

if (require.main === module) {
    const { checkedDbPool } = require('../common')
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test() {
        const pool = await checkedDbPool(CONNECTION_STRING);
        const result = await updateDrawResult(pool, 1, { c: 4 });
        console.log(result);
        pool.end(() => { console.log("close db pool") });
    }
    test();
}