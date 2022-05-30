describe('api 映射模块', () => {
  // 在所有单测运行前执行，用于准备当前 describe 模块所需要的环境准备，比如全局的数据库；
  beforeAll(() => {});

  // 在每个单测运行前执行，用于准备每个用例（it）所需要的操作，比如重置 server app 操作
  beforeEach(() => {
    jest.mock('debug');
  });

  // 在每个单测运行后执行，用于清理每个用例（it）的相关变量，比如重置所有模块的缓存
  afterEach(() => {
    jest.resetModules();
  });

  // 在所有单测运行后执行，用于清理环境，比如清理一些为了单测而生成的“环境准备”
  afterAll(() => {});

  it('当 env 为默认的 development 环境时，返回 localhost 地址', async () => {
    const add = require('../number-add.js');
    const total = add(1, 2);
    console.log('total', total);
    expect(total).toBe(3);
  });
});
