/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as llm from "./llmTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare const dbPath = "data/licences.db";
export declare const canUpdateObject: (obj: llm.Record, reqSession: Express.SessionData) => boolean;
export declare const getRawRowsColumns: (sql: string, params: Array<string | number>) => RawRowsColumnsReturn;
export declare const getDashboardStats: () => {
    currentDate: number;
    currentDateString: string;
    windowStartDate: number;
    windowStartDateString: string;
    windowEndDate: number;
    windowEndDateString: string;
    licenceStats: {
        licenceCount: number;
        distinctOrganizationCount: number;
        distinctLocationCount: number;
    };
    eventStats: {
        todayCount: number;
        pastCount: number;
        upcomingCount: number;
    };
    events: llm.LotteryEvent[];
    reminderStats: {
        todayCount: number;
        pastCount: number;
        upcomingCount: number;
    };
    reminders: llm.OrganizationReminder[];
};
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
export declare const getLicences: (reqBodyOrParamsObj: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: string;
    locationID?: number;
    locationName?: string;
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
interface LotteryLicenceForm {
    licenceID?: string;
    externalLicenceNumber: string;
    applicationDateString: string;
    organizationID: string;
    municipality: string;
    locationID: string;
    startDateString: string;
    endDateString: string;
    startTimeString: string;
    endTimeString: string;
    licenceDetails: string;
    termsConditions: string;
    licenceTypeKey: string;
    totalPrizeValue: string;
    ticketType_ticketType: string | string[];
    ticketType_unitCount: string | string[];
    ticketType_licenceFee: string | string[];
    ticketType_manufacturerLocationID: string | string[];
    ticketType_distributorLocationID: string | string[];
    ticketType_toAdd?: string | string[];
    ticketType_toDelete?: string | string[];
    eventDate: string | string[];
    fieldKeys: string;
    licenceFee?: string;
}
export declare const createLicence: (reqBody: LotteryLicenceForm, reqSession: Express.SessionData) => number;
export declare const updateLicence: (reqBody: LotteryLicenceForm, reqSession: Express.SessionData) => boolean;
export declare const deleteLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const getDistinctTermsConditions: (organizationID: number) => llm.TermsConditionsStat[];
export declare const pokeLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const issueLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const unissueLicence: (licenceID: number, reqSession: Express.SessionData) => boolean;
export declare const getLicenceTypeSummary: (reqBody: {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}) => any[];
export declare const getActiveLicenceSummary: (reqBody: {
    startEndDateStartString: string;
    startEndDateEndString: string;
}, reqSession: Express.SessionData) => llm.LotteryLicence[];
export declare const addTransaction: (reqBody: {
    licenceID: string;
    transactionAmount: string;
    transactionNote: string;
    externalReceiptNumber: string;
    issueLicence: "" | "true";
}, reqSession: Express.SessionData) => number;
export declare const voidTransaction: (licenceID: number, transactionIndex: number, reqSession: Express.SessionData) => boolean;
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
export declare const getEvent: (licenceID: number, eventDate: number, reqSession: Express.SessionData) => llm.LotteryEvent;
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
export declare const getApplicationSetting: (settingKey: string) => string;
export declare const updateApplicationSetting: (settingKey: string, settingValue: string, reqSession: Express.SessionData) => boolean;
export {};
