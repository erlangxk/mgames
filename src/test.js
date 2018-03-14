const app = require('./index');
const server = app.listen();
const request = require('supertest');

describe('Hello world', () => {
    afterAll((done) => {
        server.close(done);
    });

    test('should say hello world', async () => {
        const res = await request(server).get('/');
        expect(res.statusCode).toBe(200);
    });

    test('parse json correctly', async () => {
        const res = await request(server).post('/api/bet/drawId/token').type('json').send({ foo: 'barz' });
        console.log(res.text);
        expect(res.statusCode).toBe(200);
    });

});