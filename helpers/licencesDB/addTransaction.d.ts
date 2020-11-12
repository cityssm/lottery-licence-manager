export declare const addTransaction: (reqBody: {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: "" | "true";
}, reqSession: any) => number;
