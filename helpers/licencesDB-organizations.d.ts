import type * as llm from "../types/recordTypes";
export declare const getInactiveOrganizations: (inactiveYears: number) => llm.Organization[];
export declare const getDeletedOrganizations: () => llm.Organization[];
export declare const deleteOrganizationRepresentative: (organizationID: number, representativeIndex: number) => boolean;
export declare const setDefaultOrganizationRepresentative: (organizationID: number, representativeIndex: number) => boolean;
export declare const getOrganizationBankRecords: (organizationID: number, accountNumber: string, bankingYear: number) => llm.OrganizationBankRecord[];
export declare const getOrganizationBankRecordStats: (organizationID: number) => any[];
