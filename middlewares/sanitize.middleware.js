import { body, query } from 'express-validator';

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

export { sanitizeInput, sanitizeQuery };
