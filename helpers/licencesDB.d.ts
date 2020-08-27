/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import type * as llm from "../types/recordTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare const canUpdateObject: (obj: llm.Record, reqSession: Express.SessionData) => boolean;
export declare const getRawRowsColumns: (sql: string, params: Array<string | number>) => RawRowsColumnsReturn;
export declare const resetEventTableStats: () => void;
export declare const resetLicenceTableStats: () => void;
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
export declare const getDistinctTermsConditions: (organizationID: number) => llm.TermsConditionsStat[];
export declare const getLicenceTypeSummary: (reqBody: {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}) => any[];
export declare const getActiveLicenceSummary: (reqBody: {
    startEndDateStartString: string;
    startEndDateEndString: string;
}, reqSession: Express.SessionData) => llm.LotteryLicence[];
export declare const getEventTableStats: () => llm.LotteryEventStats;
export declare const getEvents: (reqBody: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}, reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getRecentlyUpdateEvents: (reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getOutstandingEvents: (reqBody: {
    eventDateType?: string;
    licenceTypeKey?: string;
}, reqSession: Express.SessionData) => llm.LotteryEvent[];
export declare const getEventFinancialSummary: (reqBody: {
    eventDateStartString: string;
    eventDateEndString: string;
}) => any[];
export declare const getPastEventBankingInformation: (licenceID: number) => any[];
export declare const updateEvent: (reqBody: {
    licenceID: string;
    eventDate: string;
    reportDateString: string;
    bank_name: string;
    bank_address: string;
    bank_accountNumber: string;
    bank_accountBalance: string;
    costs_receipts: string;
    costs_admin: string;
    costs_prizesAwarded: string;
    costs_amountDonated: string;
    fieldKeys: string;
}, reqSession: Express.SessionData) => boolean;
export declare const deleteEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => boolean;
export declare const pokeEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => boolean;
export declare const getLicenceActivityByDateRange: (startDate: number, endDate: number, _reqBody: {}) => {
    startDateString: string;
    endDateString: string;
    licences: llm.LotteryLicence[];
    events: llm.LotteryEvent[];
};
export declare const getApplicationSettings: () => any[];
export declare const updateApplicationSetting: (settingKey: string, settingValue: string, reqSession: Express.SessionData) => boolean;
