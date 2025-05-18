import { query } from 'express-validator';

export const placeValidators = {
  search: [
    query('lat')
      .exists().withMessage('Latitude is required')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
        
    query('lng')
      .exists().withMessage('Longitude is required')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
        
    query('radius')
      .exists().withMessage('Radius is required')
      .isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
        
    query('serviceId')
      .optional()
      .isInt({ min: 1 }).withMessage('Service ID must be a positive integer'),
        
    query('keyword')
      .optional()
      .isString().withMessage('Keyword must be a string'),
        
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        
    query('pageSize')
      .optional()
      .isInt({ min: 1 }).withMessage('Page size must be a positive integer'),
  ],
};
