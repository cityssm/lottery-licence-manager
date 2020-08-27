import type * as llm from "../../types/recordTypes";
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
