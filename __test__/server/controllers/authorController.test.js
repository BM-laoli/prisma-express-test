const supertest = require('supertest');
const { initConnection, disconnect } = require('../../../db');
const app = require('../../../app');
const { logger } = require('../../../utils/logger');

describe('author controller', () => {
  let server;

  beforeAll(async () => {
    return initConnection();
  });

  beforeEach(() => {
    if (server) {
      server.close();
    }
    server = app.listen(3333);
  });

  afterEach(() => {});

  afterAll(() => {
    server.close();
    return disconnect();
  });

  it('controller get success', (done) => {
    supertest(server)
      .get('/author')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        // console.log('status-->', res.status); 其实 = 200 也是说明这个测试用例通过来
        // console.log('body-->', res.body);
        if (err) return done(err);
        return done();
      });
  });
});
