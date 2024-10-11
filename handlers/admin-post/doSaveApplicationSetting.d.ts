import type { Request, Response } from 'express';
export interface DoSaveApplicationSettingResponse {
    success: boolean;
}
export default function handler(request: Request<unknown, unknown, {
    settingKey: string;
    settingValue: string;
}>, response: Response<DoSaveApplicationSettingResponse>): void;
