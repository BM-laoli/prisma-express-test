const express = require('express');
const generaController = require('../controllers/genraController');
const generaRouter = express.Router();
const { wrap } = require('../utils/');

// CRUD
generaRouter.post('/', wrap(generaController.create));
generaRouter.get('/', wrap(generaController.query));
generaRouter.put('/', wrap(generaController.update));
generaRouter.delete('/', wrap(generaController.deleteGenre));

module.exports = generaRouter;
