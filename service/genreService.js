const GenreModel = require('../model/Genre');

const createGenre = async (data) => {
  const res = await GenreModel.create(data);
  return res;
};

const queryGenre = async (query) => {
  const res = await GenreModel.find();
  return res;
};

const update = async (id, data) => {
  const res = await GenreModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await GenreModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  createGenre: createGenre,
  queryGenre: queryGenre,
  update: update,
  findAndDelete: findAndDelete,
};
