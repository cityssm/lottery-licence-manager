import type * as llm from "../../types/recordTypes";
interface GetLicenceActivityByDateRangeReturn {
    startDateString: string;
    endDateString: string;
    licences?: llm.LotteryLicence[];
    events?: llm.LotteryEvent[];
}
export declare const getLicenceActivityByDateRange: (startDate: number, endDate: number) => GetLicenceActivityByDateRangeReturn;
export {};
