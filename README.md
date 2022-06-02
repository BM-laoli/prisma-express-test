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

> 其实我实在事很无语，我认为这种中文文档就很...很迷，对于阅读该文档的同学我给你们一个建议：
> 在下，粗浅的任务，官方的中文文档确实有点拉胯，基本上都是机器翻译的，如果你会 English 最好读原文，可能更加的准确，而且这个东西 graphql很新，它里面 有非常多的概念，机会没两句 就 是用这个概念解释 另一个概念，我建议的阅读顺序是 1- 去官网 点击 ：“马上开始” 找到JavaScript 支持，找到 Apollo Server 把这个东西的代码搞下来自己跑起。 然后在官方的内容 都拿这个来做实验，2- 点击学习，先看 入门 这一篇文章，3- 直接啦到最下面 先把 “Schema 和 类型” 下的东西 都过一遍，再回头看 “查询和变更” 的东西，4- 看看剩下的 “验证” + “执行” + “内省” + "最佳实践"

**思路要搞清楚**，我建议在阅读的时候 ，抓住 这样的核心：“我如何查询？（包括各种筛选什么的，用postman这么去测试什么的）我如何修改变更？”， 好啦 话不多说 正式进入正题

### Nodejs ( Express + mongoose )

> 感觉话题有点跑远啦 怎么扯到这个话题上来呢...，但是这个是必要的 是学习后面内容的前提条件 ，各位老铁还是乖乖的耐心看完它吧 ,请前往参看 Mongoose.md + POAndTesting,md 文档
> 我们的项目上此此演示的功能全部都在 graphql-node 分支上，（注意这个分支 基础的服务都弄好啦，依据前面的文档，Mongoose.md + POAndTesting,md ，如果你只希望简单使用 graphql 关心service的实现，可以跳过service的相关的东西 ，接着向下阅读即可）

### 理论知识

*是什么？*

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

*它都有哪些概念？*

> 前面我就说过 ，之所以这个graphql的文档 难看，是因为它总是在用 你不懂的概念去解释另一个概念，干脆我们一次性把它 一五一十 说明白！

1. 什么是 操作类型
在graphql 中，一共有三种操作类型，查询、变更、订阅

- 查询: query : 这个....非常的简单不过多介绍
- 变更mutation： 主要是对数据的 create modify 和delete 操作
- 订阅subscription： 主要是数据发生变化的时候，自动去推送

```
# 比如我们的查询
query {
  author {
    id
  }
}
```

2. 对象类型 和 标量类型
讲这两个概念之前我们先了解一下 ，一个http graphql 请求到达 之后，我们是如何解析和处理的。（这里我们举例说明query）
首先graphQL服务接受query  -> 从这个root Query 开始查找 -> 找到 对象类型 （Object Type）的时候就要使用解析函数 Resolver 来获取其内容
-> 发现解析器返回又是一个ObjectType 继续获取，--> 一直找啊找，知道找到标量类型（Scalar Type）结束获取，直到获取到最后一个标量类型

用户在Schema 中定义的type 就是 对象类型，（解释一下什么是Schema，它是一种声明，有来声明graph 就能解析 你的query了  ）

```js
// 比如这样
type User {
  name: String!
  age: Int
}
```

标量类型，就是一些graphQL 内置的类型：String Int Float Boolean ID 等...也允许用户自定义标量

3. 模式是什么Schema
上面有聊到什么是Schema 并且大概介绍了一下，我们现在来看个例子🌰 下面的就是一个生产级别的Schema 它专门为graph 服务, 顺便提一嘴哈，在query 的时候graph 是并行的，在mutation 的时候是串行的。

```js
# src/schema.graphql

# Query 入口
type Query {
    hello: String
    users: [User]!
    user(id: String): [User]!
}

# Mutation 入口
type Mutation {
    createUser(id: ID!, name: String!, email: String!, age: Int,gender: Gender): User!
    updateUser(id: ID!, name: String, email: String, age: Int, gender: Gender): User!
    deleteUser(id: ID!): User
}

# Subscription 入口
type Subscription {
    subsUser(id: ID!): User
}

type User implements UserInterface {
    id: ID!
    name: String!
    age: Int
    gender: Gender
    email: String!
}

# 枚举类型
enum Gender {
    MAN
    WOMAN
}

# 接口类型
interface UserInterface {
    id: ID!
    name: String!
    age: Int
    gender: Gender
}
```

4. 解析函数 Resolver
实际上它就是一个函数，提供数据用的，比如现在我有这样的query 和这样的resolver 他们就是这样组合在来一起

```js
//  query 是你的Scheme
query {
  author
}

// 对应的Resolver
Query: { 
  author ( parent, args, context, info ) {
    return .....
  }
}

// 这里我们解释一下 这几个参数哈
/*
1. 参数1 ：当前上一个解析函数的返回值

2. 参数2：查询中传入的参数

3. 参数3：提供给所有解析器的上下文信息

4. 参数4：一个保存与当前查询相关的字段特定信息以及 schema 详细信息的值
*/
```

5. 请求的格式
前面都是在说如何做如何做，偏向理论化了，现在我们来说说，客户端如何发一条http 请求到graphql service 呢？

*如果你是GET 你可以这样*

```
http://myapi/graphql?query={me{name}}
```

*如果你是POST 你可以这样*

```
{
  "query": "...",
  "operationName": "...",
  "variables": { "myVariable": "someValue", ... }
}
```

### 项目实践指南

> 好啦，上面讲啦很多废话，讲啦很多理论的东西，现在我们先看看如何实际运用哈。首先这里说明一下，我们是基于已经构建好的REST API 进行的修改，如果你不晓得我这个API 是如何构建的，请移步看另一片文章，那里有详细的说明，它大概长这样

*项目结构*
![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1654088573513-2b1e0e45-0c37-4868-a8f6-5c8cac22ad0d.png)

*POST MAN*
![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1654088614087-b433cebe-de29-43ed-aa79-80e4fb4978a5.png)

1. 首先我们开始我们项目第一步，工欲善必先利其器也，
首先我们准备 graphql、express-graphql、graphql-tools，第一个是核心必须要的，第二个 是和express 配套的，第三个是一个tools 工具可以方便整理和管理你的 schema等内容

2. 构建项目结构，我们新增一个文件用来存放 我们这个项目的shcema ,并且写入下面的 schema （query）

```js
//  /graphql/schema.js 去定义 schema
// 我们先做 比较独立的模块 对 author 的 Query
const typeDefs = /* GraphQL */ `
  type Query {
    author(id: String): Author
    authors: [Author]!
  }

  type Author {
    id: ID!
    first_name: String
    family_name: String
    date_of_birth: String
    date_of_death: String
    age: Int
  }
`;

module.exports = {
  typeDefs: typeDefs,
};

//  /graphql/resolver 去定义resolver
const { queryAuthor } = require('../service/authorService');
const resolvers = {
  Query: {
    authors(parent, args, ctx, info) {
      return queryAuthor({});
    },
    author(parent, args, ctx, info) {
      const { id } = args;
      return queryAuthor({ id: id });
    },
  },
};

module.exports = {
  resolvers: resolvers,
};

//  /graphql/index 去定义 收口
const { resolvers } = require('./resolvers');
const { typeDefs } = require('./schema');
const { makeExecutableSchema } = require('@graphql-tools/schema');
//  特别注意 ⚠️  对于es6 使用  npx babel-node  index.js 去编译 部分esModule,

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = {
  schema: schema,
};

//  /app.js  构建一个graphQL 路由
++++
const { graphqlHTTP } = require('express-graphql');
const { schema } = require('./graphql');
++++
// 下面是单独的graphQL 路由
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
  }),
);
++++

```

下面的c-url

```shell
# 你如何请求呢？ 我们以postman 为例子 c-url 如下
curl --location -g --request GET 'http://localhost:3000/graphql?query={authors {first_name  id  family_name 
age }} ' \
--header 'Content-Type: application/json' \
--data-raw '{
    "first_name":"Ace",
    "family_name":"Y",
    "date_of_birth":"2022-05-21T15:40:50.926Z",
    "date_of_death":"2022-05-21T15:40:50.926Z"
}'

# 带条件的查询
curl --location -g --request GET 'http://localhost:3000/graphql?query={author(id: "62890ef9ecfd69398ee75752") { id }} ' \
--header 'Content-Type: application/json' \
--data-raw '{
    "first_name":"Ace",
    "family_name":"Y",
    "date_of_birth":"2022-05-21T15:40:50.926Z",
    "date_of_death":"2022-05-21T15:40:50.926Z"
}'
```

**关联查询如何构建？**
> 我们还是以上面的get来说，这一次我们要获取 book 我们需要查询它的author ，这如何做呢？

```js
// 我们接着在原来的scheme 的地方添加一个book
const typeDefs = /* GraphQL */ `
  type Query {
    author(id: String): Author
    authors: [Author]!
    books: [Book]
  }

  type Author {
    id: ID!
    first_name: String
    family_name: String
    date_of_birth: String
    date_of_death: String
    age: Int
  }

  type Book {
    id: ID!
    title: String
    author: Author
    summary: String
    isbn: String
  }
`;

// 然后我们在resolver 的时候同样的操作就好啦 其他不用变
const { queryAuthor } = require('../service/authorService');
const { queryBook } = require('../service/bookService');
const resolvers = {
  Query: {
    authors(parent, args, ctx, info) {
      return queryAuthor({});
    },
    books() {
      queryBook({}).then((res) => {
        console.log('--->', res);
      });

      return queryBook({}); // 关联查询交给 service来做
    },
  },
};

module.exports = {
  resolvers: resolvers,
};

// 下面 是它的 c-curl
curl --location -g --request GET 'http://localhost:3000/graphql?query={books { id summary author {  id first_name  } }} ' \
--header 'Content-Type: application/json' \
--data-raw '{
    "first_name":"Ace",
    "family_name":"Y",
    "date_of_birth":"2022-05-21T15:40:50.926Z",
    "date_of_death":"2022-05-21T15:40:50.926Z"
}'
```

3. mutation 变更数据
上面我们主要是把graphQL 的query 都讲了一遍，接下来我们来说说 它的mutation, 比如我现在需要 创建名为xx 的author、  修改id = xxxx 的author的名称、以及删除 id 为xxx 的author

```js
// 关于变更要求统一在 mutation 下进行 我们来定义 schema 主要是新增来这样的一个 type
+++
`
  type Mutation {
    createAuthor(first_name: String, family_name: String, age: Int): Author!
    updateAuthor(
      id: ID!
      first_name: String
      family_name: String
      age: Int
    ): Author!
    deleteAuthorByID(id: ID!): Author!
  }
  `
  +++

// 然后需要去 resolver 里构建对应的方法
+++
  Mutation: {
    createAuthor: async (parent, args) => {
      const { id, first_name, family_name, age } = args;
      return await createAuthor({ id, first_name, family_name, age });
    },
    deleteAuthorByID: async (parent, args) => {
      return await findAndDelete(args.id);
    },
    updateAuthor: async (parent, args) => {
      const { id, first_name, family_name, age } = args;
      const author = await queryAuthor({ id: id });
      // 由于authorService 中使用 了 findByIdAndUpdate 它返回的是被修改前的模样
      // 所以我们又去查了一遍
      if (!author) {
        throw new Error('查无此人');
      }
      await update(id, {
        first_name,
        family_name,
        age,
      });
      return await queryAuthor({ id: id });
    },
  },
+++
```

在Postman 上，实际上在body 参数上是有快捷的 GraphQL 操作的，特别骚气的是 它可以 自动获取你的所有 schema 并且如果在你写的时候有自动提示，如果你写错啦，它还会自动报错，啊，这个功能还是香的啊，

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1654097081546-fadd3474-13d2-418e-97e3-76dea8c4d793.png)

下面我给了一个update的时候的 c-url供你体验

```shell
curl --location --request POST 'http://localhost:3000/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"mutation {\n    updateAuthor(id:\"62890ef9ecfd69398ee75752\", first_name:\"Joney\",\n        family_name:\"joney\", age:23){\n        id\n        family_name\n    }\n}","variables":{}}'
```

4. 订阅数据变化

> 这里主要是做了这样的一个操作：“我们实现了类似Job 的功能，发现 某个id 的author 中的age 改变后，打印一个log” （TODO 这是一个复杂的部分，因为如果是单机器性能有限，如果是多节点比如丢k8s上还会存在别的问题，因此如何做 才能满足，这是一个大话题，这里暂时按下不表）

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
