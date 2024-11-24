import { Request, Response, NextFunction } from 'express';
import { PaginationOptions } from '../types/pagination';

declare global {
  namespace Express {
    interface Request {
      pagination: PaginationOptions;
    }
  }
}

export const paginationMiddleware = (
  defaultLimit: number = 10,
  maxLimit: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit as string) || defaultLimit)
    );
    const sort = req.query.sort as string;

    req.pagination = {
      page,
      limit,
      sort
    };

    next();
  };
};