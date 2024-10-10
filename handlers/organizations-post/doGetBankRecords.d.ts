import type { Request, Response } from 'express';
interface DoGetBankRecordsRequest {
    organizationID: string;
    bankingYear: string;
    accountNumber: string;
}
export default function handler(request: Request<unknown, unknown, DoGetBankRecordsRequest>, response: Response): void;
export {};
