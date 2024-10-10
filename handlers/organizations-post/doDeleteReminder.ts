import type { Request, Response } from 'express'

import deleteOrganizationReminder from '../../helpers/licencesDB/deleteOrganizationReminder.js'

interface DoDeleteReminderRequest {
  organizationID: string
  reminderIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoDeleteReminderRequest>,
  response: Response
): void {
  const success = deleteOrganizationReminder(
    request.body.organizationID,
    request.body.reminderIndex,
    request.session.user
  )

  response.json({ success })
}
