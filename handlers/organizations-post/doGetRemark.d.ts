import type { Request, Response } from 'express';
interface DoGetRemarkRequest {
    organizationID: string;
    remarkIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoGetRemarkRequest>, response: Response): void;
export {};
