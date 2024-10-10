import type { Request, Response } from 'express';
interface DoDismissReminderRequest {
    organizationID: string;
    reminderIndex: string;
}
export default function handler(request: Request<unknown, unknown, DoDismissReminderRequest>, response: Response): void;
export {};
