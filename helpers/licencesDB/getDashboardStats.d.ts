import type * as llm from "../../types/recordTypes";
interface LicenceStats {
    licenceCount: number;
    distinctOrganizationCount: number;
    distinctLocationCount: number;
}
interface EventStats {
    todayCount: number;
    pastCount: number;
    upcomingCount: number;
}
interface ReminderStats {
    todayCount: number;
    pastCount: number;
    upcomingCount: number;
}
interface GetDashboardStatsReturn {
    currentDate: number;
    currentDateString: string;
    windowStartDate: number;
    windowStartDateString: string;
    windowEndDate: number;
    windowEndDateString: string;
    licenceStats: LicenceStats;
    eventStats: EventStats;
    events: llm.LotteryEvent[];
    reminderStats: ReminderStats;
    reminders: llm.OrganizationReminder[];
}
export declare const getDashboardStats: () => GetDashboardStatsReturn;
export {};
