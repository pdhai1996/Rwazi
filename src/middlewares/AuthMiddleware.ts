import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthenticatedRequest<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any, 
    ReqQuery = ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: any;
}

export const AuthMiddleware = (
    req: AuthenticatedRequest<any, any, any, any>,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};