import type { Request, Response } from 'express';
import { type ReminderData } from '../../helpers/licencesDB/addOrganizationReminder.js';
export default function handler(request: Request<unknown, unknown, ReminderData>, response: Response): void;
