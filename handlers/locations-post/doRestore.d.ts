import type { Request, Response } from 'express';
export interface DoRestoreLocationResponse {
    success: boolean;
    message: string;
}
export default function handler(request: Request<unknown, unknown, {
    locationID: string;
}>, response: Response<DoRestoreLocationResponse>): void;
