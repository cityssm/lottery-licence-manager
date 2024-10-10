import type { LotteryEvent, User } from '../../types/recordTypes.js';
export default function getOutstandingEvents(requestBody: {
    eventDateType?: string;
    licenceTypeKey?: string;
}, requestUser: User): LotteryEvent[];
