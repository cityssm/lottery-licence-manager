/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
export declare const dbPath = "data/licences.db";
import * as llm from "./llmTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare const canUpdateObject: (obj: llm.Record, reqSession: Express.SessionData) => boolean;
export declare const getRawRowsColumns: (sql: string, params: any[]) => RawRowsColumnsReturn;
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
export declare const getLicences: (reqBodyOrParamsObj: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string;
    organizationName?: string;
    licenceStatus?: string;
    locationID?: number;
}, reqSession: Express.SessionData, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}) => {
    count: number;
    licences: llm.LotteryLicence[];
};
export declare const getLicence: (licenceID: number, reqSession: Express.SessionData) => llm.LotteryLicence;
export declare const getNextExternalLicenceNumberFromRange: () => number;
export declare const createLicence: (reqBody: any, reqSession: Express.SessionData) => number;
export declare const updateLicence: (reqBody: any, reqSession: Express.SessionData) => boolean;
export declare const deleteLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const getDistinctTermsConditions: (organizationID: number) => llm.TermsConditionsStat[];
export declare const pokeLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const issueLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const unissueLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const getLicenceTypeSummary: (reqBody: any) => any[];
export declare const getActiveLicenceSummary: (reqBody: any, reqSession: Express.SessionData) => llm.LotteryLicence[];
export declare const addTransaction: (reqBody: any, reqSession: Express.SessionData) => number;
export declare const voidTransaction: (licenceID: number, transactionIndex: number, reqSession: Express.SessionData) => boolean;
export declare const getEventTableStats: () => llm.LotteryEventStats;
export declare const getEvents: (reqBody: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    eventYear?: string;
}, reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getRecentlyUpdateEvents: (reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getOutstandingEvents: (reqBody: any, reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getEventFinancialSummary: (reqBody: any) => any[];
export declare const getEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => llm.LotteryEvent;
export declare const getPastEventBankingInformation: (licenceID: number) => any[];
export declare const updateEvent: (reqBody: any, reqSession: Express.SessionData) => boolean;
export declare const deleteEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => boolean;
export declare const pokeEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => boolean;
export declare const getLicenceActivityByDateRange: (startDate: number, endDate: number, _reqBody: any) => {
    startDateString: string;
    endDateString: string;
    licences: llm.LotteryLicence[];
    events: llm.LotteryEvent[];
};
export declare const getApplicationSettings: () => any[];
export declare const getApplicationSetting: (settingKey: string) => string;
export declare const updateApplicationSetting: (settingKey: string, settingValue: string, reqSession: Express.SessionData) => boolean;
