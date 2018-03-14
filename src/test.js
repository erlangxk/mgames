const app = require('./index');
const server = app.listen();

const request = require('supertest').agent(server);

describe('Hello world', () => {
    afterAll(() => {
        server.close();
    });

    test('should say hello world', (done) => {
        request.get('/').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        }
        );
    });
});