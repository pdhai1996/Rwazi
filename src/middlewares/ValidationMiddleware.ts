import { validationResult } from 'express-validator';
import { IReq, IRes } from '@src/routes/common/types';
import { NextFunction } from 'express';

/**
 * Middleware to validate request data based on validator rules
 * Returns 422 status with error details if validation fails
 */
export const validateRequest = (req: IReq, res: IRes, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Invalid request',
      errors: errors.array()
    });
  }else{
      next();
  }
};
