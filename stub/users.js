async function authToken(token) {
    const p = new Promise((resolve, reject) => {
        setTimeout(() => resolve({
            username: "jobs",
            test: true,
            currency: "USD",
        }), 1000);
    });
    return p;
}

module.exports = authToken;