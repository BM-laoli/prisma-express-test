const supertest = require('supertest');
const { initConnection, disconnect } = require('../../../db');
const app = require('../../../app');
const { logger } = require('../../../utils/logger');

describe('server 服务', () => {
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

  it('req-info 日志正常', async () => {
    await supertest(server)
      .get('/author')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const loggerPromiseQuery = () => {
      return new Promise((resolve, reject) => {
        logger.query(
          {
            from: new Date() - 24 * 60 * 60 * 1000,
            until: new Date(),
            limit: 10,
            start: 0,
            order: 'desc',
          },
          (err, res) => {
            const messageInfo = res.file.filter(
              (it) => it.level === 'info' && typeof it.message === 'object',
            )[0];
            resolve(messageInfo.message.originURL);
          },
        );
      });
    };

    const value = await loggerPromiseQuery();

    // 如果日志和测试一样 说明 这个日志是对等的 这个case 通过
    expect(value).toBe('/author');
  });
});
