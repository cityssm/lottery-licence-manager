import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    eventDateType: '' | 'past' | 'upcoming';
    licenceTypeKey: string;
}>, response: Response): void;
