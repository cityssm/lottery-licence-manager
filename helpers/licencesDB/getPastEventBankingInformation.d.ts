export interface PastEventBankingInformation {
    bank_name: string;
    bank_address: string;
    bank_accountNumber: string;
    eventDateMax: number;
    eventDateMaxString: string;
}
export declare const getPastEventBankingInformation: (licenceID: number | string) => PastEventBankingInformation[];
