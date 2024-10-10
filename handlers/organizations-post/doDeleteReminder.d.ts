import type { Request, Response } from 'express';
interface DoDeleteReminderRequest {
    organizationID: string;
    reminderIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoDeleteReminderRequest>, response: Response): void;
export {};
