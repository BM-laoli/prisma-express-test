const express = require('express');
const bookController = require('../controllers/bookController');
const bookRouter = express.Router();
const { wrap } = require('../utils/');

// CRUD
bookRouter.post('/', wrap(bookController.create));
bookRouter.get('/', wrap(bookController.query));
bookRouter.put('/', wrap(bookController.update));
bookRouter.delete('/', wrap(bookController.deleteBook));

module.exports = bookRouter;
