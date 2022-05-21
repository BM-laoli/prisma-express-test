const express = require('express') 
const bodyParser = require('body-parser')
const connet = require('./db')

const app = express()


app.use(bodyParser.json())

// 应用这个 中间件
app.get("/graphql", async (req, res) => {
  res.json({
    name: '8888'
  })
})

const server = app.listen(3000, () => {
  console.log('server start');
})
