const genreService = require('../service/genreService');

const create = async (req, res, next) => {
  const value = await genreService.createGenre(req.body);
  res.json(value);
};

const query = async (req, res, next) => {
  const value = await genreService.queryGenre(req.query);
  res.json(value);
};

const update = async (req, res, next) => {
  const value = await genreService.update(req.query.id, req.body);
  res.json(value);
};

const deleteGenre = async (req, res, next) => {
  const value = await genreService.findAndDelete(req.query.id);
  res.json(value);
};

module.exports = {
  create: create,
  query: query,
  update: update,
  deleteGenre: deleteGenre,
};
