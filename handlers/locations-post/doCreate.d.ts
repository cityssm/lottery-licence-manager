import type { Request, Response } from 'express';
import type { Location } from '../../types/recordTypes.js';
export interface DoCreateLocationResponse {
    success: true;
    locationID: number;
    locationDisplayName: string;
}
export default function handler(request: Request<unknown, unknown, Location>, response: Response<DoCreateLocationResponse>): void;
