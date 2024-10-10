import type { NextFunction, Request, Response } from 'express';
export default function handler(request: Request<{
    organizationID: string;
}, unknown, {
    representativeIndex: string;
}>, response: Response, next: NextFunction): void;
