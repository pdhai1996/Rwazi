import { Response, Request } from 'express';
import { AuthenticatedRequest } from '@src/middlewares/AuthMiddleware';


/******************************************************************************
                                Types
******************************************************************************/

type TRecord = Record<string, unknown>;
export type IReq = AuthenticatedRequest<TRecord, void, TRecord, TRecord>;
export type IRes = Response<unknown, TRecord>;

