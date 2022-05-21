const express = require('express');

const bookInstanceRouter = express.Router();

// CRUD
bookInstanceRouter.post('/', async (req, res) => {
  res.json({
    message: 'create',
  });
});

bookInstanceRouter.get('/', async (req, res) => {
  res.json({
    message: 'get',
  });
});

bookInstanceRouter.put('/', async (req, res) => {
  res.json({
    message: 'delete',
  });
});

bookInstanceRouter.delete('/:id', async (req, res) => {
  res.json({
    message: `delete==> ${req.params.id}`,
  });
});

module.exports = bookInstanceRouter;
