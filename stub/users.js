async function authToken(token) {
    const p = new Promise((resolve, reject) => {
        setTimeout(() => resolve({
            username: "jobs",
            test: true,
            currency: "USD",
        }), 0);
    });
    return p;
}

module.exports = authToken;