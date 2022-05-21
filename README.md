# 说明

## 分支一览

- node-base (基础入门)
- graphql-node （纯的graphql介绍，只说graphql 不包含其他内容）
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

## graphql-node

> 纯的graphql介绍，只说graphql 不包含其他内容，这是为了能让我们更加流畅的配合prisma 使用，的前提教学. 这里呢我需要先列出我的议席参考资料，<https://mongoosejs.com/，mongoose>，这里我们使用 mongoDB 来作为我们的数据库。然后还借鉴了 ，这位大佬的文章，虽然是3年前的，但是放到今天，我依然觉得质量 吊打很多 文章 😂 <https://juejin.cn/post/6844903795407716366#heading-5>

> 文章技术结构和 参考文章保持一致，但是带有自己的跟多解读  MongoDB + graphql + graph-pack

### graphql 的文档

### 导论 和注意事项

> 在下，粗浅的任务，官方的中文文档确实有点拉胯，基本上都是机器翻译的，如果你会 English 最好读原文，可能更加的准确，而且这个东西 graphql很新，它里面 有非常多的概念，机会没两句 就 是用这个概念解释 另一个概念，我建议的阅读顺序是 1- 去官网 点击 ：“马上开始” 找到JavaScript 支持，找到 Apollo Server 把这个东西的代码搞下来自己跑起。 然后在官方的内容 都拿这个来做实验，2- 点击学习，先看 入门 这一篇文章，3- 直接啦到最下面 先把 “Schema 和 类型” 下的东西 都过一遍，再回头看 “查询和变更” 的东西，4- 看看剩下的 “验证” + “执行” + “内省” + "最佳实践"

**思路要搞清楚**，我建议在阅读的时候 ，抓住 这样的核心：“我如何查询？（包括各种筛选什么的，用postman这么去测试什么的）我如何修改变更？”， 好啦 话不多说 正式进入正题

### Nodejs ( Express + mongoose )

> 感觉话题有点跑远啦 怎么扯到这个话题上来呢...，但是这个是必要的 是学习后面内容的前提条件 ，各位老铁还是乖乖的耐心看完它吧 ,请前往参看 Mongoose.md 文档

### 基础知识

#### 一些重要的概念

##### 是什么

  首先哈这个graphql 到底是什么东西，我们需要心中有数，它实际上是一种规范，或者说是一个 “前后端交换数据的协议，你请求啥啥啥必须要在xx里这样写，我才能查出来给你”，它的演示图 如下
  ![](https://i.loli.net/2019/03/10/5c84b1dca1c5f.gif)

  假设我要查询：“id=123user的name ，和他去过的所有城市的名字和所属省份 并且取前十条数据”，那么我可以这样写

```
query {
  user (id : "233") {
    name
    citys (first: 10) {
      name
      province
    }
  }
}

```

##### 它都有哪些概念？

> 前面我就说过 ，之所以这个graphql的文档 难看，是因为它总是在用 你不懂的概念去解释另一个概念，干脆我们一次性把它 一五一十 说明白！

### 项目实践

## graphql

> 这个分支，基于前面的分支，再次打造的一个点，专门针对 graphql 进行的有机的结合，使得我们的Server非常的简单且易懂。首 先我这要说明一点：**Graphql非处的冗长且复杂**，它作为完全不同于SQL的一种查询语言，和规范，你如果回他 需要有一定的经验和踩坑，它的资料页不是很多，至少在国内是比较少。而且理解和编码SQL 都是一个完全不同的东西，因此需要一定的成本去试映这个东西；下面的东西是我个人的见解，如果有不对的地方 ，麻烦各位道友指点，关于graphql 除了官方文档之外，这里有一篇 为比较推荐的博客，欢迎阅读

> 下面的结合 graphql的代码

```js
const express = require('express') 
const bodyParser = require('body-parser')
const prismaClint = require('@prisma/client')
const { graphqlHTTP } = require('express-graphql');

const { makeExecutableSchema } = require('@graphql-tools/schema')
// 对于es6 使用  npx babel-node  index.js 去编译 部分esModule, 


// -------------init------------- 
const prisma = new prismaClint.PrismaClient()
const app = express()

// -------------使用graphql------------- 
// 1. 定义类型 和 query
const typeDefs = `
  type User {
    email: String!
    name: String
  }
  type Query {
    allUsers: [ User! ] !
  }
  `

// 2. 定义irsolvers 和 与前面对于的query参数
const resolvers = {
  Query: {
    allUsers: () => {
      return prisma.user.findMany()
    }
  }
}

// 3. 定义 schema 规则
const schema = makeExecutableSchema({
  resolvers,
  typeDefs
})


app.use(bodyParser.json())
app.use("/graphql", graphqlHTTP({
  schema
}))

const server = app.listen(3000, () => {
  console.log('server start');
})

```

**不知道为什么，我发现一个非常操蛋的事情，就是很多博客只负责告诉你这么写，然后完全就不管然后了，比如如何用postman去掉，也不管，但是我很良心！请把良心打在评论区！**

```curl
curl --location --request POST 'http://localhost:3000/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{
    "query": "query { allUsers { email } }"
}'
```
