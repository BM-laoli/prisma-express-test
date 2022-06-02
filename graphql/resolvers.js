const {
  queryAuthor,
  update,
  createAuthor,
  findAndDelete,
} = require('../service/authorService');
const { queryBook } = require('../service/bookService');
const resolvers = {
  Query: {
    authors(parent, args, ctx, info) {
      return queryAuthor({});
    },
    author(parent, args, ctx, info) {
      const { id } = args;
      return queryAuthor({ id: id });
    },
    books() {
      return queryBook({}); // 关联查询交给 service来做
    },
  },
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
};

module.exports = {
  resolvers: resolvers,
};
