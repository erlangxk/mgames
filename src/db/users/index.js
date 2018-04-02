const { transaction, catchDatabaseError } = require('../common')

const SQL_LOAD_USER = 'SELECT user_id FROM users WHERE operator_id=$1 AND username=$2';
const SQL_INSERT_USER = 'INSERT INTO users (operator_id,username,create_time) VALUES ($1,$2,$3) RETURNING user_id';

async function selectUserOrInsert(pool, operatorId, username) {
    return catchDatabaseError(async () => {
        return transaction(pool, async (client) => {
            const qr = await client.query(SQL_LOAD_USER, [operatorId, username]);
            if (qr.rows.length === 0) {
                const ir = await client.query(SQL_INSERT_USER, [operatorId, username, Date.now()]);
                return ir.rows[0].user_id;
            } else {
                return qr.rows[0].user_id;
            }
        })
    });
}

module.exports = {
    selectUserOrInsert
};

if (require.main === module) {
    const { checkedDbPool } = require('../common')
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test() {
        const pool = await checkedDbPool(CONNECTION_STRING);
        console.dir(pool);
        const result = await selectUserOrInsert(pool, "xxxxx", "xxx");
        console.log(`result:${result}`);
        pool.end(() => { console.log("close db pool") });
    }
    test();
}