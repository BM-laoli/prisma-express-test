# 说明

## 分支一览

- node-base (基础入门)
- graphql （进阶组合使用）

## node-base

> 这个分支主要的内容是 Prisma  + Express  + mysql进行的实践，没有特别复杂的场景，只是作为一个小的demo帮助大家入门使用 Prisma ，为迈入更高的Prisma 高级用法，打好基础
  
### 首先我们应该去看官方的文档具体的顺序是

  1. <https://www.prisma.io/> 前往主页。聊天它到底是个什么东西，我用一句话来概括：“它是一个面向未来设计的orm 库，非常适合nodejs 去使。它的组成是：“客户端工具,prisma-client-js” + "cli工具生成的schema" + 官方提供的可视化操作工具。

  2. 拉到页面最下面，找到 PRISMA WITH，点击with express，大概的看一遍，不要实际去操作

  3. 找到 RESOURCES，找到Get Stated 按照官方文档走

  4. 关于query 和其他文档在这里
  query参数的参考指南：
  <https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#deletemany-1>，
  关于各种概念的解释和文档：
  <https://www.prisma.io/docs/concepts/components/prisma-migrate>
  
  5. 文档指南
  <https://www.prisma.io/docs/>

### 来自我的实战

  > 由于本人，从事Node开发有丰富的经验，所以我很快的搭建了一个基于express的serve

  ```js
  const express = require('express') 
  const bodyParser = require('body-parser')

  const app = express()
  const posts = {
    name:"666"
  }
  app.use(bodyParser.json())
  
  app.get('/user/all', async (req, res) => {
  
  res.json({
    name: 6666
  })
})

  app.listen(3000)
  ```

  执行下面的命令之后，我们就能够访问这个serve了

  ```shell
  nodemon index.js
  ```
  
  > 第二步, 按照官方的说明首先，我使用 prisma cli 初始化了 其配置

  ```shell
  yarn add prisma
  npx prisma init 
  # 这个命令做了两件事：

# 1.创建一个名为的新目录prisma，其中包含一个名为 的文件schema.prisma，该文件包含 Prisma 模式以及您的数据库连接变量和模式模型
# 2.在项目根目录下创建.env文件，用于定义环境变量（比如你的数据库连接）
  ```

> 第三步，按照官方要求，我去构建了我的结构，和数据库连接,

```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}

```

环境配置

```env
DATABASE_URL="mysql://root:rootroot@192.168.101.10:3306/node_prisma"
```

> 第四步，我们需要将定义的模型正确的生成SQL 和表结构

```shell
npx prisma migrate dev --name init
# 上面的命令，帮助我们做了下面这件事
# 1. 它为此迁移创建一个新的 SQL 迁移文件, 以后 你会使用它的 
# 2. 它针对数据库运行 SQL 迁移文件
```

> 第五步，使用客户端操作工具去操作数据库  

```shell
yarn add  @prisma/client
```

最后的你的代码就是这样的了，特别需要注意的是 ，对于关联关系的修改方式会方法

```js
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

```

## graphql

> 这个分支，基于前面的分支，再次打造的一个点，专门针对 graphql 进行的有机的结合，使得我们的Server非常的简单且易懂
