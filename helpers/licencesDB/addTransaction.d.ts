import type * as expressSession from "express-session";
export declare const addTransaction: (requestBody: {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: "" | "true";
}, requestSession: expressSession.Session) => number;
