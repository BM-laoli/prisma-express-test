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
