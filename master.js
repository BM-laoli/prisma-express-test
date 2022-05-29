const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.end('hello world');
});

// 我们改成启动的时候读取 而不是每次请求读取，约等于做啦一次缓存
const file = fs.readFileSync(__dirname + '/index.html', 'utf-8');
app.get('/index', (req, res) => {
  /* return buffer */
  res.end(file);
  /* return stream */
  // fs.createReadStream(__dirname + '/index.html').pipe(res)
});

app.listen(3000);
