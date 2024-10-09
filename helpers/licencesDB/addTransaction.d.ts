import type * as expressSession from 'express-session';
export interface AddTransactionForm {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: '' | 'true';
}
export default function addTransaction(requestBody: AddTransactionForm, requestSession: expressSession.Session): number;
