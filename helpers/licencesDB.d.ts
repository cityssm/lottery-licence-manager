/// <reference types="express-session" />
import * as llm from "./llmTypes";
export declare function getRawRowsColumns(sql: string, params: any[]): llm.RawRowsColumnsReturn;
export declare function getLocations(reqBodyOrParamsObj: any, reqSession: Express.SessionData, queryOptions: {
    limit: number;
    offset?: number;
}): llm.Location[];
export declare function getLocation(locationID: number, reqSession: Express.SessionData): llm.Location;
export declare function createLocation(reqBody: llm.Location, reqSession: Express.SessionData): number;
export declare function updateLocation(reqBody: llm.Location, reqSession: Express.SessionData): boolean;
export declare function deleteLocation(locationID: number, reqSession: Express.SessionData): boolean;
export declare function restoreLocation(locationID: number, reqSession: Express.SessionData): boolean;
export declare function mergeLocations(targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData): boolean;
export declare function getInactiveLocations(inactiveYears: number): llm.Location[];
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
export declare function getLicenceTableStats(): llm.LotteryLicenceStats;
export declare function getLicences(reqBodyOrParamsObj: any, reqSession: Express.SessionData, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}): {
    count: number;
    licences: llm.LotteryLicence[];
};
export declare function getLicence(licenceID: number, reqSession: Express.SessionData): llm.LotteryLicence;
export declare function getNextExternalLicenceNumberFromRange(): number;
export declare function createLicence(reqBody: any, reqSession: Express.SessionData): number;
export declare function updateLicence(reqBody: any, reqSession: Express.SessionData): boolean;
export declare function deleteLicence(licenceID: number, reqSession: Express.SessionData): boolean;
export declare function getDistinctTermsConditions(organizationID: number): llm.TermsConditionsStat[];
export declare function pokeLicence(licenceID: number, reqSession: Express.SessionData): boolean;
export declare function issueLicence(licenceID: number, reqSession: Express.SessionData): boolean;
export declare function unissueLicence(licenceID: number, reqSession: Express.SessionData): boolean;
export declare function getLicenceTypeSummary(reqBody: any): any[];
export declare function getActiveLicenceSummary(reqBody: any, reqSession: Express.SessionData): llm.LotteryLicence[];
export declare function addTransaction(reqBody: any, reqSession: Express.SessionData): number;
export declare function voidTransaction(licenceID: number, transactionIndex: number, reqSession: Express.SessionData): boolean;
export declare function getEventTableStats(): llm.LotteryEventStats;
export declare function getEvents(year: number, month: number, reqSession: Express.SessionData): llm.LotteryEvent[];
export declare function getOutstandingEvents(reqBody: any, reqSession: Express.SessionData): llm.LotteryEvent[];
export declare function getEventFinancialSummary(reqBody: any): any[];
export declare function getEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): llm.LotteryEvent;
export declare function updateEvent(reqBody: any, reqSession: Express.SessionData): boolean;
export declare function deleteEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): boolean;
export declare function pokeEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): boolean;
export declare function getApplicationSettings(): any[];
export declare function getApplicationSetting(settingKey: string): string;
export declare function updateApplicationSetting(settingKey: string, settingValue: string, reqSession: Express.SessionData): boolean;
