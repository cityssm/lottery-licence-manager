import type { Request, Response } from 'express';
import { type GetEventsFilters } from '../../helpers/licencesDB/getEvents.js';
export default function handler(request: Request<unknown, unknown, GetEventsFilters & {
    limit: string;
    offset: string;
}>, response: Response): void;
