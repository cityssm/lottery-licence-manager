interface GetOrganizationBankRecordStatsReturn {
    accountNumber: string;
    bankingYearMin: number;
    bankingYearMax: number;
}
export default function getOrganizationBankRecordStats(organizationID: number | string): GetOrganizationBankRecordStatsReturn[];
export {};
