import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    eventDate: string;
}>, response: Response): void;
