import type { User } from '../../types/recordTypes.js';
export interface AddTransactionForm {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: '' | 'true';
}
export default function addTransaction(requestBody: AddTransactionForm, requestUser: User): number;
