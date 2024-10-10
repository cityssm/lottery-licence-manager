import type { Request, Response } from 'express'

import addOrganizationReminder, {
  type ReminderData
} from '../../helpers/licencesDB/addOrganizationReminder.js'

export default function handler(
  request: Request<unknown, unknown, ReminderData>,
  response: Response
): void {
  const reminder = addOrganizationReminder(request.body, request.session.user)

  response.json({
    success: true,
    reminder
  })
}
