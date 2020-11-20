import type * as expressSession from "express-session";
export declare const addTransaction: (reqBody: {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: "" | "true";
}, reqSession: expressSession.Session) => number;
