import type * as llm from "../types/recordTypes";
import type { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
import type * as expressSession from "express-session";
export declare const canUpdateObject: (object: llm.Record, requestSession: expressSession.Session) => boolean;
export declare const getRawRowsColumns: (sql: string, parameters: Array<string | number>, userFunctions: Map<string, (...parameters: any) => any>) => RawRowsColumnsReturn;
export declare const resetEventTableStats: () => void;
export declare const resetLicenceTableStats: () => void;
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
export declare const getLicenceTypeSummary: (requestBody: {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}) => any[];
export declare const getActiveLicenceSummary: (requestBody: {
    startEndDateStartString: string;
    startEndDateEndString: string;
}, requestSession: expressSession.Session) => llm.LotteryLicence[];
export declare const getEventTableStats: () => llm.LotteryEventStats;
export declare const getRecentlyUpdateEvents: (requestSession: expressSession.Session) => llm.LotteryEvent[];
