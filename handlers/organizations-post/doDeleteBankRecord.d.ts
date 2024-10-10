import type { Request, Response } from 'express';
interface DoDeleteBankRecordRequest {
    organizationID: string;
    recordIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoDeleteBankRecordRequest>, response: Response): void;
export {};
