const express = require('express');
const AuthorController = require('../controllers/authorController');
const author = express.Router();

// CRUD
author.post('/', AuthorController.create);
author.get('/', AuthorController.query);
author.put('/', AuthorController.update);
author.delete('/', AuthorController.deleteAuthor);

module.exports = author;
