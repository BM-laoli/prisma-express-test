const express = require('express');

const author = express.Router();

// CRUD
author.post('/', async (req, res) => {
  res.json({
    message: 'create',
  });
});

author.get('/', async (req, res) => {
  res.json({
    message: 'get',
  });
});

author.put('/', async (req, res) => {
  res.json({
    message: 'delete',
  });
});

author.delete('/:id', async (req, res) => {
  res.json({
    message: `delete==> ${req.params.id}`,
  });
});

module.exports = author;
