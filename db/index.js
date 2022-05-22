const mongoose = require('mongoose');
const dbConfig = require('./config');

const initConnection = async () => {
  // 注意mongoDB 的数据库密码 只对当前的库有效！
  // const connection = mongoose.connect("mongodb://admin:123456@192.168.101.10:27017/admin",
  //   { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
  return new Promise((resolve, reject) => {
    // const connection = mongoose.connect('mongodb://192.168.101.10:27017/test', {
    //   useUnifiedTopology: true,
    //   useNewUrlParser: true,
    // });
    const connection = mongoose.connect(
      // 我们的test 通过admin库进行登录认证，才能去操作
      'mongodb://admin:123456@192.168.101.10:27017/test?authSource=admin',
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
    );
    // 让 mongoose 使用全局 Promise 库
    mongoose.Promise = global.Promise;

    mongoose.connection.on('connected', (err) => {
      resolve(connection);
    });

    mongoose.connection.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = initConnection;
