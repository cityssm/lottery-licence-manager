import type { Request, Response } from 'express';
import type { LotteryEvent } from '../../types/recordTypes.js';
export default function handler(request: Request<unknown, unknown, {
    eventDateType: '' | 'past' | 'upcoming';
    licenceTypeKey: string;
}>, response: Response<LotteryEvent[]>): void;
