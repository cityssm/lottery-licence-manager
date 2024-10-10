import type { User } from '../../types/recordTypes.js';
export interface UpdateEventForm {
    licenceID: string;
    eventDate: string;
    reportDateString: string;
    bank_name: string;
    bank_address: string;
    bank_accountNumber: string;
    bank_accountBalance: string;
    costs_amountDonated: string;
    fieldKeys: string;
    ticketTypes: string;
}
export default function updateEvent(requestBody: UpdateEventForm, requestUser: User): boolean;
