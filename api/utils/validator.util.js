import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),

    body('email')
        .isEmail()
        .withMessage('Valid email required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid email required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];
