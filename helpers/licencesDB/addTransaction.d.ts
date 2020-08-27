/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
export declare const addTransaction: (reqBody: {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: "" | "true";
}, reqSession: Express.SessionData) => number;
