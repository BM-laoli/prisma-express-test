const express = require('express');
const generaController = require('../controllers/genraController');
const generaRouter = express.Router();

// CRUD
generaRouter.post('/', generaController.create);
generaRouter.get('/', generaController.query);
generaRouter.put('/', generaController.update);
generaRouter.delete('/', generaController.deleteGenre);

module.exports = generaRouter;
