import type { RawRowsColumnsReturn } from '@cityssm/expressjs-server-js/types';
import type * as llm from '../types/recordTypes';
export declare function canUpdateObject(object: llm.Record, requestUser: llm.User | undefined): boolean;
export declare function getRawRowsColumns(sql: string, parameters: unknown[], userFunctions: Map<string, (...parameters: unknown[]) => unknown>): RawRowsColumnsReturn;
export declare function resetEventTableStats(): void;
export declare function resetLicenceTableStats(): void;
export declare function getLicenceTableStats(): llm.LotteryLicenceStats;
export interface GetLicenceTypeSummaryForm {
    applicationDateStartString?: string;
    applicationDateEndString?: string;
    licenceTypeKey?: string;
}
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
export declare function getLicenceTypeSummary(requestBody: GetLicenceTypeSummaryForm): GetLicenceTypeSummmaryReturn[];
export interface GetActiveLicenceSummaryForm {
    startEndDateStartString: string;
    startEndDateEndString: string;
}
export declare function getActiveLicenceSummary(requestBody: GetActiveLicenceSummaryForm, requestUser: llm.User): llm.LotteryLicence[];
export declare function getEventTableStats(): llm.LotteryEventStats;
export declare function getRecentlyUpdateEvents(requestUser: llm.User): llm.LotteryEvent[];
export {};
