import type { LotteryEvent, OrganizationReminder } from '../../types/recordTypes';
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
    events: LotteryEvent[];
    reminderStats: ReminderStats;
    reminders: OrganizationReminder[];
}
export default function getDashboardStats(): GetDashboardStatsReturn;
export {};
