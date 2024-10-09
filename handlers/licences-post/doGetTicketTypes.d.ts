import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    licenceTypeKey: string;
}>, response: Response): void;
