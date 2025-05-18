import { body, param } from 'express-validator';

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
    ]
};
