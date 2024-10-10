import type { Request, Response } from 'express';
interface DoDeleteRemarkRequest {
    organizationID: string;
    remarkIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoDeleteRemarkRequest>, response: Response): void;
export {};
