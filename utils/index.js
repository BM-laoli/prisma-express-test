module.exports = {
  // 一个包装工具 🔧可以马上把 路由函数的的error 处理到next 去，
  // 减少try 的冗余代码
  wrap:
    (fn) =>
    (...args) =>
      fn(...args).catch(args[2]),
};
