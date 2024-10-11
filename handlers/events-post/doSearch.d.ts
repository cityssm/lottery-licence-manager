import type { Request, Response } from 'express';
import { type GetEventsFilters, type GetEventsReturn } from '../../helpers/licencesDB/getEvents.js';
export default function handler(request: Request<unknown, unknown, GetEventsFilters & {
    limit: string;
    offset: string;
}>, response: Response<GetEventsReturn>): void;
export type { GetEventsReturn as DoSearchEventsResponse } from '../../helpers/licencesDB/getEvents.js';
