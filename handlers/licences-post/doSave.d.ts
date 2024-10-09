import type { Request, Response } from 'express';
import { type LotteryLicenceForm } from '../../helpers/licencesDB/updateLicence.js';
export default function handler(request: Request<unknown, unknown, LotteryLicenceForm & {
    licenceID: string;
}>, response: Response<{
    success: boolean;
    licenceID?: number;
    message?: string;
}>): void;
