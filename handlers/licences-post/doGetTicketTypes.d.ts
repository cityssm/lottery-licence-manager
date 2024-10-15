import type { Request, Response } from 'express';
import type { ConfigTicketType } from '../../types/configTypes.js';
export type DoGetTicketTypesResponse = ConfigTicketType[];
export default function handler(request: Request<unknown, unknown, {
    licenceTypeKey: string;
}>, response: Response<DoGetTicketTypesResponse>): void;
