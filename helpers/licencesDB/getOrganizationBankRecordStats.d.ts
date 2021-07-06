interface GetOrganizationBankRecordStatsReturn {
    accountNumber: string;
    bankingYearMin: number;
    bankingYearMax: number;
}
export declare const getOrganizationBankRecordStats: (organizationID: number | string) => GetOrganizationBankRecordStatsReturn[];
export {};
