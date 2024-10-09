import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    settingKey: string;
    settingValue: string;
}>, response: Response): void;
