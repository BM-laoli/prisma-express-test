const express = require('express') 
const bodyParser = require('body-parser')
const prismaClint = require('@prisma/client')

// -------------init------------- 
const prisma = new prismaClint.PrismaClient()
const app = express()
const posts = {
  name:"666"
}
app.use(bodyParser.json())

// user . 使用 prisma 写更少的代码，做更多的事情
app.get('/user/all', async (req, res) => {
  const data = await prisma.user.findMany({
    include:{ // 把其关联的东西都查询出来
      posts:true,
      profile:true
     }
  })
  res.json(data)
})

app.post('/user/create', async (req, res) => {
  const data  = await prisma.user.create({
    data: {
      ...req.body
      // 如果有这样的外建 关系，prisma 会为我们自动关联 和创建，不需要我们操作
      /**
       * 
       * posts": {
        "create": {
            "title": "Hello World"
              }
          },
          "profile": {
              "create": {
                  "bio": "I like turtles"
              }
          }
       */
    }
  })
  res.json(data)
})

app.put('/user', async (req, res) => {
  const { id } = req.body;
  const data = await prisma.user.update({
    where: { id },
    data: { 
      ...req.body
     }
  });
  res.json(data);
})

app.delete('/user/:id', async (req, res) => {
  const { id  } = req.params; 
  // 如果要删 这个用户，那么它关联的外 健 需要一并删除
  
  const data = await prisma.user.update({
    where: { id: Number(id) },
   data:{
    posts: { // 单 有多个关联关系的时候使用这个， 它会物理删除！
      // delete: [ { id: 2 } ]  // 难不成这个2 一直写出来？如果你需要
      // 删除 全部请使用 下面的字段
      deleteMany:{}
    },
    profile: {  // 如果仅仅有一个的关联关系的时候使用这个， 它会物理删除！
      delete:true
    }
   }
  })  
  const isok = await prisma.user.delete({
    where: { id: Number(id) },
  })  
  res.json(isok)
})

const server = app.listen(3000, () => {
  console.log('server start');
})
