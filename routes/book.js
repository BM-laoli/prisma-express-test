const express = require('express');

const book = express.Router();

// CRUD
book.post('/', async (req, res) => {
  res.json({
    message: 'create',
  });
});

book.get('/', async (req, res) => {
  res.json({
    message: 'get',
  });
});

book.put('/', async (req, res) => {
  res.json({
    message: 'delete',
  });
});

book.delete('/:id', async (req, res) => {
  res.json({
    message: `delete==> ${req.params.id}`,
  });
});

module.exports = book;
