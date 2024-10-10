import type { Request, Response } from 'express'

import dismissOrganizationReminder from '../../helpers/licencesDB/dismissOrganizationReminder.js'
import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js'

interface DoDismissReminderRequest {
  organizationID: string
  reminderIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoDismissReminderRequest>,
  response: Response
): void {
  const organizationID = request.body.organizationID
  const reminderIndex = request.body.reminderIndex

  const success = dismissOrganizationReminder(
    organizationID,
    reminderIndex,
    request.session.user
  )

  if (success) {
    const reminder = getOrganizationReminder(
      organizationID,
      reminderIndex,
      request.session.user
    )

    response.json({
      success: true,
      message: 'Reminder dismissed.',
      reminder
    })
  } else {
    response.json({
      success: false,
      message: 'Reminder could not be dismissed.'
    })
  }
}
