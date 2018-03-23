const request = require('superagent');

async function test() {
    try {
        const res = await request.get('http://localhost:8000/api/auth/token');
        console.log(res.body);
        console.log(res.status);
        console.log(res.header);
    } catch (err) {
        console.error("http failed", err);
    }
}

if (require.main === module) {
    test();
}