import type { Request, Response } from 'express';
import { type GetLicencesFilters } from '../../helpers/licencesDB/getLicences.js';
export default function handler(request: Request<unknown, unknown, GetLicencesFilters & {
    limit: string;
    offset: string;
}>, response: Response): void;
