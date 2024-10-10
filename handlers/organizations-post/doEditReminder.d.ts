import type { Request, Response } from 'express';
import { type UpdateOrganizationReminderForm } from '../../helpers/licencesDB/updateOrganizationReminder.js';
export default function handler(request: Request<unknown, unknown, UpdateOrganizationReminderForm>, response: Response): void;
