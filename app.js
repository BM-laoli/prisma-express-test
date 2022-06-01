const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const { logger } = require('./utils/logger');
const { reqInfo } = require('./middleware/reqInfo');
const author = require('./routes/author');
const book = require('./routes/book');
const genre = require('./routes/genre');
const bookInstance = require('./routes/bookInstance');

const app = express();
app.use(bodyParser.json());
app.use(compression());

// 引用全局中间件
app.use(reqInfo);

// 我们定义一个路由对User 和 Book 做路由的CRUD
app.use('/author', author);
app.use('/book', book);
app.use('/genre', genre);
app.use('/book-instance', bookInstance);

// 设置一个路由，如果前面的都有问题，就到这里来处理错误
app.use((err, req, res, next) => {
  logger.error({
    level: 'error',
    message: err.message,
  });
  res.status(500).json(err);
});
module.exports = app;
