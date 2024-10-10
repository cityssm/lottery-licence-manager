import type { NextFunction, Request, Response } from 'express';
export default function handler(request: Request, response: Response, next: NextFunction): Promise<void>;
