import type * as expressSession from "express-session";
interface UpdateEventForm {
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
export declare const updateEvent: (requestBody: UpdateEventForm, requestSession: expressSession.Session) => boolean;
export {};
