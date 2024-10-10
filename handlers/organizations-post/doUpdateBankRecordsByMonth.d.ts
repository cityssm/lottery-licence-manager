import type { Request, Response } from 'express';
import type { OrganizationBankRecordType } from '../../types/recordTypes.js';
interface DoUpdateBankRecordsByMonthRequest {
    organizationID: string;
    accountNumber: string;
    bankingYear: string;
    bankingMonth: string;
    bankRecordTypeIndex: string;
    [recordIndex: `recordIndex-${string}`]: string;
    [bankRecordType: `bankRecordType-${string}`]: OrganizationBankRecordType;
    [recordDateString: `recordDateString-${string}`]: string;
    [recordNote: `recordNote-${string}`]: string;
    [recordIsNA: `recordIsNA-${string}`]: string;
}
export default function handler(request: Request<unknown, unknown, DoUpdateBankRecordsByMonthRequest>, response: Response): void;
export {};
