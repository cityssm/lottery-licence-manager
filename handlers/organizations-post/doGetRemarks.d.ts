import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    organizationID: string;
}>, response: Response): void;
