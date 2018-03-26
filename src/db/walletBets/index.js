const SQL_INSERT_WALLET_BET = 'INSERT INTO wallet_bet (bet_id, amount, create_time) values ($1,$2,$3) RETURNING game_trx_id';
async function insertWalletBet(client, betId, amount) {
    const result = await client.query(SQL_INSERT_WALLET_BET, [betId, amount, Date.now()]);
    return result.rows[0].game_trx_id;
}



const SQL_UPDATE_WALLET_BET = 'UPDATE wallet_bet SET wallet_trx_id=$1, last_update_time=$2, wallet_return_code=$3, error=$4 WHERE game_trx_id=$5';
async function updateWalletBet(pool, walletTrxId, walletCode, error, gameTrxId) {
    const result = await pool.query(SQL_UPDATE_WALLET_BET, [walletTrxId, Date.now(), walletCode, error, gameTrxId]);
    return result.rowCount;
}


if (require.main === module) {
    const {checkedDbPool} = require('../common')
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test(){
        const pool = await checkedDbPool(CONNECTION_STRING);
        const result = await updateWalletBet(pool, "aaa","bbb", 0, 1);
        console.log(result);
        pool.end(() => { console.log("close db pool") });
    }
    test();
}