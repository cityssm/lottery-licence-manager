import type * as llm from "../../types/recordTypes";
export declare const getLicenceActivityByDateRange: (startDate: number, endDate: number) => {
    startDateString: string;
    endDateString: string;
    licences: llm.LotteryLicence[];
    events: llm.LotteryEvent[];
};
