import type { Request, Response } from 'express';
interface DoGetReminderRequest {
    organizationID: string;
    reminderIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoGetReminderRequest>, response: Response): void;
export {};
