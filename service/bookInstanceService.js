const BookInstanceModel = require('../model/BookInstance');

const create = async (data) => {
  const res = await BookInstanceModel.create(data);
  return res;
};

const query = async (query) => {
  //子表关联主表查询，populate里面为子表外键
  const res = await BookInstanceModel.find().populate('book').exec();
  return res;
};

const update = async (id, data) => {
  const res = await BookInstanceModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await BookInstanceModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  create: create,
  query: query,
  update: update,
  findAndDelete: findAndDelete,
};
