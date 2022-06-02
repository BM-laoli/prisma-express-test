const AuthorModel = require('../model/Author');

const createAuthor = async (data) => {
  const res = await AuthorModel.create(data); // AuthorModel.save(data); 也可以
  return res;
};

const queryAuthor = async (query) => {
  if (query.id) {
    const res = await AuthorModel.findById(query.id);
    return res;
  }
  const res = await AuthorModel.find(); // 查所有
  return res;
};

const update = async (id, data) => {
  const res = await AuthorModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await AuthorModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  createAuthor: createAuthor,
  queryAuthor: queryAuthor,
  update: update,
  findAndDelete: findAndDelete,
};
