const express = require('express');
const bookInstanceController = require('../controllers/bookInstanceController');
const bookRouter = express.Router();
const { wrap } = require('../utils/');

// CRUD
bookRouter.post('/', wrap(bookInstanceController.create));
bookRouter.get('/', wrap(bookInstanceController.query));
bookRouter.put('/', wrap(bookInstanceController.update));
bookRouter.delete('/', wrap(bookInstanceController.deleteBookInstance));

module.exports = bookRouter;
