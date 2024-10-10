import type { Request, Response } from 'express';
interface DoRollForwardRequest {
    organizationID: string;
    updateFiscalYear: string;
    updateReminders: string;
}
export default function handler(request: Request<unknown, unknown, DoRollForwardRequest>, response: Response): void;
export {};
