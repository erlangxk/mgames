const db = require('./index');

if (require.main === module) {
    const CONNECTION_STRING = 'postgres://postgres:111111@localhost/mgames';
    async function test(){
        const pool = await db.checkedDbPool(CONNECTION_STRING);
        const result = await db.selectUserOrInsert(pool, "xxxxx", "xxx");
        console.log(result);
        pool.end(() => { console.log("close db pool") });
    }
    test();
}