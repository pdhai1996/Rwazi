import { body, param, query } from 'express-validator';

export const favoriteValidators = {
    addFavorite: [
        body('placeId')
            .exists().withMessage('Place ID is required')
            .isInt({ min: 1 }).withMessage('Place ID must be a valid positive integer')
    ],
    
    removeFavorite: [
        param('favoriteId')
            .exists().withMessage('Favorite ID is required')
            .isInt({ min: 1 }).withMessage('Favorite ID must be a valid positive integer')
    ],
    
    checkFavorite: [
        param('placeId')
            .exists().withMessage('Place ID is required')
            .isInt({ min: 1 }).withMessage('Place ID must be a valid positive integer')
    ],
    
    getUserFavorites: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('pageSize')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
    ]
};
