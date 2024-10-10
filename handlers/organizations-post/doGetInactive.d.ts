import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    inactiveYears: string;
}>, response: Response): void;
