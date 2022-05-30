// 速查表
// .toBe(value) // 期望值为 value
// .toEqual(value) // 期望两个对象内容完全相等
// .toBeDefined() // 期望被定义
// .toBeFalsy() // 期望为 Falsy
// .toBeTruthy() // 期望 Truthy
// .toMatch() // 期望符合，支持字符串和正则对象
// .toThrow() // 期望抛错

// .toHaveBeenCalled() // 方法被调用
// .toHaveBeenCalledWith(arg1, arg2, ...) // 方法被以参数 arg1, arg2, ... 调用
// .toHaveBeenCalledTimes(number) // 方法被调用次数为 number 次
// 以上 expect 语句均可取非，形式如下：not.toBe()

describe('api 映射模块', () => {
  // 在所有单测运行前执行，用于准备当前 describe 模块所需要的环境准备，比如全局的数据库；
  beforeAll(() => {
    console.log('所有单元测试开始前');
  });

  // 在每个单测运行前执行，用于准备每个用例（it）所需要的操作，比如重置 server app 操作
  beforeEach(() => {
    console.log('每个 所有单元测试开始前');
  });

  // 在每个单测运行后执行，用于清理每个用例（it）的相关变量，比如重置所有模块的缓存
  afterEach(() => {
    console.log('每个 所有单元测试结束后');
    jest.resetModules();
  });

  // 在所有单测运行后执行，用于清理环境，比如清理一些为了单测而生成的“环境准备”
  afterAll(() => {
    console.log('所有 所有单元测试结束后');
  });

  // 注：以上四个方法均支持返回一个 Promise，此时 Jest 将等待该 Promise resolve 后继续

  it('当 env 为默认的 development 环境时，返回 localhost 地址', async () => {});

  it.only('当 env 为测试环境时，返回测试环境地址', async () => {});
});
