const { body, query } = require('express-validator');

function sanitizeInput() {
  return [
    body('*').trim().escape(),
    body('email').optional().normalizeEmail()
  ];
}

function sanitizeQuery() {
  return [
    query('*').trim().escape()
  ];
}

module.exports = { sanitizeInput, sanitizeQuery };
