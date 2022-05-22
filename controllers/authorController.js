const authorService = require('../service/authorService');

const create = async (req, res, next) => {
  try {
    const value = await authorService.createAuthor(req.body);
    res.json(value);
  } catch (error) {
    res.json(error);
  }
};

const query = async (req, res, next) => {
  const value = await authorService.queryAuthor(req.query);
  res.json(value);
};

const update = async (req, res, next) => {
  const value = await authorService.update(req.query.id, req.body);
  res.json(value);
};

const deleteAuthor = async (req, res, next) => {
  const value = await authorService.findAndDelete(req.query.id);
  res.json(value);
};

module.exports = {
  create: create,
  query: query,
  update: update,
  deleteAuthor: deleteAuthor,
};
