import type { Request, Response } from 'express';
import { type GetOrganizationsFilters } from '../../helpers/licencesDB/getOrganizations.js';
export default function handler(request: Request<unknown, unknown, GetOrganizationsFilters>, response: Response): void;
