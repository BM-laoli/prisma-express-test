const mongoose = require('mongoose');
const dbConfig = require('./config')

// 注意mongoDB 的数据库密码 只对当前的库有效！
// const connection = mongoose.connect("mongodb://admin:123456@192.168.101.10:27017/admin",
//   { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
const connection = mongoose.connect("mongodb://192.168.101.10:27017/test",{ useUnifiedTopology: true, useNewUrlParser: true })

mongoose.connection.on("connecting", err => {
  console.log("连接中....");
});

mongoose.connection.on("connected", err => {
  console.log("连接成功");
});

mongoose.connection.on('error', err => {
  console.log("连接失败");
  console.log(err);
})

module.exports = connection