const express = require('express');
const bodyParser = require('body-parser');
const initConnection = require('./db');
const author = require('./routes/author');
const book = require('./routes/book');
const genre = require('./routes/genre');

const app = express();
app.use(bodyParser.json());

// 我们定义一个路由对User 和 Book 做路由的CRUD
app.use('/author', author);
app.use('/book', book);
app.use('/genre', genre);

initConnection().then(() => {
  app.listen(3000, () => {
    console.log('server start');
  });
});
