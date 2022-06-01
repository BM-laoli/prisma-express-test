const supertest = require('supertest');
const { initConnection, disconnect } = require('../../db');
const app = require('../../app');

//  重要介绍，每次app.listen 都是启动的一个服务实例 的操作，所以我们才把应用的启动
//  和app 配置 分开，还要注意，由于实例的问题，如果你在每个 it 中都去listen 会导致有问题
//  所以我们把它 放在 这些钩子 中 ，很重要！！另外我们一定要配合 supertest 来做nodejs 的
//  单元测试，现在我们有来这样的基础的模板 template 后面的代码我们都回你用到它

describe('server 服务', () => {
  let server;

  beforeAll(async () => {
    // 数据库连接, 如果返回的是一个异步的 jest会等待它
    return initConnection();
  });

  beforeEach(() => {
    if (server) {
      server.close();
    }
    server = app.listen(3331);
  });

  afterEach(() => {});

  afterAll(() => {
    //释放数据库连接
    server.close();
    return disconnect();
  });

  it('启动正常', async () => {
    expect(() => supertest(server)).not.toThrow();
  });

  it('服务异常', async () => {
    await supertest(server)
      .post('/author')
      .send({ name: 'john' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        console.log('res', res);
      })
      .catch((err) => {
        expect(err.message).toBe(
          'expected 200 "OK", got 500 "Internal Server Error"',
        );
      });
  });
});
