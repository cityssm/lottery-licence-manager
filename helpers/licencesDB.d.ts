import type * as llm from "../types/recordTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
import type * as expressSession from "express-session";
export declare const canUpdateObject: (obj: llm.Record, reqSession: expressSession.Session) => boolean;
export declare const getRawRowsColumns: (sql: string, params: Array<string | number>) => RawRowsColumnsReturn;
export declare const resetEventTableStats: () => void;
export declare const resetLicenceTableStats: () => void;
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
export declare const getLicenceTypeSummary: (reqBody: {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}) => any[];
export declare const getActiveLicenceSummary: (reqBody: {
    startEndDateStartString: string;
    startEndDateEndString: string;
}, reqSession: expressSession.Session) => llm.LotteryLicence[];
export declare const getEventTableStats: () => llm.LotteryEventStats;
export declare const getRecentlyUpdateEvents: (reqSession: expressSession.Session) => llm.LotteryEvent[];
export declare const deleteEvent: (licenceID: number, eventDate: number, reqSession: expressSession.Session) => boolean;
export declare const getLicenceActivityByDateRange: (startDate: number, endDate: number, _reqBody: {}) => {
    startDateString: string;
    endDateString: string;
    licences: llm.LotteryLicence[];
    events: llm.LotteryEvent[];
};
