import type { Request, Response } from 'express';
export interface DoMergeLocationsRequest {
    targetLocationID: string;
    sourceLocationID: string;
}
export default function handler(request: Request<unknown, unknown, DoMergeLocationsRequest>, response: Response): void;
