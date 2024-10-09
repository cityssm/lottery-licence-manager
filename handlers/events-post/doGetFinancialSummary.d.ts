import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    eventDateStartString: string;
    eventDateEndString: string;
}>, response: Response): void;
