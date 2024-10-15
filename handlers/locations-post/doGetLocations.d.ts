import type { Request, Response } from 'express';
import { type GetLocationsReturn } from '../../helpers/licencesDB/getLocations.js';
export interface DoGetLocationsRequest {
    limit?: string;
    offset?: string;
    locationNameAddress: string;
    locationIsManufacturer: '' | '0' | '1';
    locationIsDistributor: '' | '0' | '1';
    locationIsActive?: 'on';
}
export default function handler(request: Request<unknown, unknown, DoGetLocationsRequest>, response: Response<GetLocationsReturn>): void;
