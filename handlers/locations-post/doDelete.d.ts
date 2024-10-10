import type { Request, Response } from 'express';
export interface DoDeleteLocationResponse {
    success: boolean;
    message: string;
}
export default function handler(request: Request<unknown, unknown, {
    locationID: string;
}>, response: Response<DoDeleteLocationResponse>): void;
