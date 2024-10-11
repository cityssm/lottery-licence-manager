import type { Request, Response } from 'express';
import { type GetLicenceActivityByDateRangeReturn } from '../../helpers/licencesDB/getLicenceActivityByDateRange.js';
export default function handler(request: Request<unknown, unknown, {
    eventDate: string;
}>, response: Response<GetLicenceActivityByDateRangeReturn>): void;
export type { GetLicenceActivityByDateRangeReturn as DoGetEventsByWeekResponse } from '../../helpers/licencesDB/getLicenceActivityByDateRange.js';
