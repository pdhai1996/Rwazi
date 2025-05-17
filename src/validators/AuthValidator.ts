import { body } from 'express-validator';

export const authValidator = {
    login: [
        body('username')
            .exists().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .trim().notEmpty().withMessage('Username cannot be empty'),
        body('password')
            .exists().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .trim().notEmpty().withMessage('Password cannot be empty'),
    ],
}