/// <reference types="express-session" />
import * as llm from "./llmTypes";
export declare function getOrganizations(reqBody: any, reqSession: Express.SessionData, includeOptions: {
    limit: number;
    offset?: number;
}): llm.Organization[];
export declare function getOrganization(organizationID: number, reqSession: Express.SessionData): llm.Organization;
export declare function createOrganization(reqBody: llm.Organization, reqSession: Express.SessionData): number;
export declare function updateOrganization(reqBody: llm.Organization, reqSession: Express.SessionData): boolean;
export declare function deleteOrganization(organizationID: number, reqSession: Express.SessionData): boolean;
export declare function restoreOrganization(organizationID: number, reqSession: Express.SessionData): boolean;
export declare function getInactiveOrganizations(inactiveYears: number): llm.Organization[];
export declare function getDeletedOrganizations(): llm.Organization[];
export declare function addOrganizationRepresentative(organizationID: number, reqBody: llm.OrganizationRepresentative): llm.OrganizationRepresentative;
export declare function updateOrganizationRepresentative(organizationID: number, reqBody: llm.OrganizationRepresentative): llm.OrganizationRepresentative;
export declare function deleteOrganizationRepresentative(organizationID: number, representativeIndex: number): boolean;
export declare function setDefaultOrganizationRepresentative(organizationID: number, representativeIndex: number): boolean;
export declare function getOrganizationRemarks(organizationID: number, reqSession: Express.SessionData): llm.OrganizationRemark[];
export declare function getOrganizationRemark(organizationID: number, remarkIndex: number, reqSession: Express.SessionData): llm.OrganizationRemark;
export declare function addOrganizationRemark(reqBody: llm.OrganizationRemark, reqSession: Express.SessionData): number;
export declare function updateOrganizationRemark(reqBody: llm.OrganizationRemark, reqSession: Express.SessionData): boolean;
export declare function deleteOrganizationRemark(organizationID: number, remarkIndex: number, reqSession: Express.SessionData): boolean;
export declare function getOrganizationBankRecords(organizationID: number, accountNumber: string, bankingYear: number): llm.OrganizationBankRecord[];
export declare function getOrganizationBankRecordStats(organizationID: number): any[];
export declare function addOrganizationBankRecord(reqBody: llm.OrganizationBankRecord, reqSession: Express.Session): boolean;
export declare function updateOrganizationBankRecord(reqBody: llm.OrganizationBankRecord, reqSession: Express.Session): boolean;
export declare function deleteOrganizationBankRecord(organizationID: number, recordIndex: number, reqSession: Express.Session): boolean;
