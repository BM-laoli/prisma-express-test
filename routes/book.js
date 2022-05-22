const express = require('express');
const bookController = require('../controllers/bookController');
const bookRouter = express.Router();

// CRUD
bookRouter.post('/', bookController.create);
bookRouter.get('/', bookController.query);
bookRouter.put('/', bookController.update);
bookRouter.delete('/', bookController.deleteBook);

module.exports = bookRouter;
