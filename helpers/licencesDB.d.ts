/// <reference types="express-session" />
export declare const dbPath = "data/licences.db";
import * as llm from "./llmTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare function canUpdateObject(obj: llm.Record, reqSession: Express.SessionData): boolean;
export declare function getRawRowsColumns(sql: string, params: any[]): RawRowsColumnsReturn;
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
export declare function getEvents(reqBody: any, reqSession: Express.SessionData): llm.LotteryEvent[];
export declare function getRecentlyUpdateEvents(reqSession: Express.SessionData): llm.LotteryEvent[];
export declare function getOutstandingEvents(reqBody: any, reqSession: Express.SessionData): llm.LotteryEvent[];
export declare function getEventFinancialSummary(reqBody: any): any[];
export declare function getEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): llm.LotteryEvent;
export declare function getPastEventBankingInformation(licenceID: number): any[];
export declare function updateEvent(reqBody: any, reqSession: Express.SessionData): boolean;
export declare function deleteEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): boolean;
export declare function pokeEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData): boolean;
export declare function getLicenceActivityByDateRange(startDate: number, endDate: number, _reqBody: any): {
    startDateString: string;
    endDateString: string;
    licences: any;
    events: any;
};
export declare function getApplicationSettings(): any[];
export declare function getApplicationSetting(settingKey: string): string;
export declare function updateApplicationSetting(settingKey: string, settingValue: string, reqSession: Express.SessionData): boolean;
