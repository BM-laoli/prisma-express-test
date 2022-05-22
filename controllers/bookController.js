const bookService = require('../service/bookService');

const create = async (req, res, next) => {
  try {
    const value = await bookService.createBook(req.body);
    res.json(value);
  } catch (error) {
    res.json(error);
  }
};

const query = async (req, res, next) => {
  const value = await bookService.queryBook(req.query);
  res.json(value);
};

const update = async (req, res, next) => {
  const value = await bookService.update(req.query.id, req.body);
  res.json(value);
};

const deleteBook = async (req, res, next) => {
  const value = await bookService.findAndDelete(req.query.id);
  res.json(value);
};

module.exports = {
  create: create,
  query: query,
  update: update,
  deleteBook: deleteBook,
};
