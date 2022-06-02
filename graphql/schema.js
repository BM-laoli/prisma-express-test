// 我们先做 比较独立的模块 对 author 的 Query

const typeDefs = /* GraphQL */ `
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

module.exports = {
  typeDefs: typeDefs,
};
