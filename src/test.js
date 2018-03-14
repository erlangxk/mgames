const app = require('./index');
const server = app.listen();

const request = require('supertest').agent(server);

describe('Hello world', () => {
    afterAll(() => {
        server.close();
    });

    test('should say hello world', async () => {
        const res = await request.get('/');
        expect(res.statusCode).toBe(200);
    });

    test('parse json correctly', async () => {
        const res = await request.post('/api/bet/drawId/token').send({ foo: 'barz' });
        expect(res.statusCode).toBe(200);
    });

});