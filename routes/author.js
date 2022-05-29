const express = require('express');
const AuthorController = require('../controllers/authorController');
const author = express.Router();
const { wrap } = require('../utils/');

// CRUD
author.post('/', wrap(AuthorController.create));
author.get('/', wrap(AuthorController.query));
author.put('/', wrap(AuthorController.update));
author.delete('/', wrap(AuthorController.deleteAuthor));

module.exports = author;
