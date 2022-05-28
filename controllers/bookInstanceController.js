const bookInstanceService = require('../service/bookInstanceService');

const create = async (req, res, next) => {
  try {
    const value = await bookInstanceService.create(req.body);
    res.json(value);
  } catch (error) {
    res.json(error);
  }
};

const query = async (req, res, next) => {
  const value = await bookInstanceService.query(req.query);
  res.json(value);
};

const update = async (req, res, next) => {
  const value = await bookInstanceService.update(req.query.id, req.body);
  res.json(value);
};

const deleteBookInstance = async (req, res, next) => {
  const value = await bookInstanceService.findAndDelete(req.query.id);
  res.json(value);
};

module.exports = {
  create: create,
  query: query,
  update: update,
  deleteBookInstance: deleteBookInstance,
};
