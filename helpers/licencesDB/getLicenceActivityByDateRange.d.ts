import type { LotteryEvent, LotteryLicence } from '../../types/recordTypes.js';
interface GetLicenceActivityByDateRangeReturn {
    startDateString: string;
    endDateString: string;
    licences?: LotteryLicence[];
    events?: LotteryEvent[];
}
export default function getLicenceActivityByDateRange(startDate: number, endDate: number): GetLicenceActivityByDateRangeReturn;
export {};
