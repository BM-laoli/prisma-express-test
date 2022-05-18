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

// 应用这个 中间件
app.use("/graphql", graphqlHTTP({
  schema
}))

const server = app.listen(3000, () => {
  console.log('server start');
})
