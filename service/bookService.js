const BookModel = require('../model/Book');

const createBook = async (data) => {
  const res = await BookModel.create(data);
  return res;
};

const queryBook = async (query) => {
  //子表关联主表查询，populate里面为子表外键
  const res = await BookModel.find()
    .populate('author')
    .populate('genre')
    .exec();
  return res;
};

const update = async (id, data) => {
  const res = await BookModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await BookModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  createBook: createBook,
  queryBook: queryBook,
  update: update,
  findAndDelete: findAndDelete,
};
