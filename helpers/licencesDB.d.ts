import type * as llm from "../types/recordTypes";
import type { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
import type * as expressSession from "express-session";
export declare const canUpdateObject: (object: llm.Record, requestSession: expressSession.Session) => boolean;
export declare const getRawRowsColumns: (sql: string, parameters: unknown[], userFunctions: Map<string, (...parameters: unknown[]) => unknown>) => RawRowsColumnsReturn;
export declare const resetEventTableStats: () => void;
export declare const resetLicenceTableStats: () => void;
export declare const getLicenceTableStats: () => llm.LotteryLicenceStats;
interface GetLicenceTypeSummmaryReturn {
    licenceID: number;
    externalLicenceNumber: string;
    applicationDate: number;
    applicationDateString?: string;
    issueDate: number;
    issueDateString?: string;
    organizationName: string;
    locationName: string;
    locationAddress1: string;
    locationDisplayName?: string;
    licenceTypeKey: string;
    licenceType?: string;
    totalPrizeValue: number;
    licenceFee: number;
    transactionAmountSum: number;
}
export declare const getLicenceTypeSummary: (requestBody: {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}) => GetLicenceTypeSummmaryReturn[];
export declare const getActiveLicenceSummary: (requestBody: {
    startEndDateStartString: string;
    startEndDateEndString: string;
}, requestSession: expressSession.Session) => llm.LotteryLicence[];
export declare const getEventTableStats: () => llm.LotteryEventStats;
export declare const getRecentlyUpdateEvents: (requestSession: expressSession.Session) => llm.LotteryEvent[];
export {};
