import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    licenceID: string;
}>, response: Response<{
    success: boolean;
    message: string;
}>): void;
