import type { Request, Response } from 'express'

import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js'
import updateOrganizationReminder, {
  type UpdateOrganizationReminderForm
} from '../../helpers/licencesDB/updateOrganizationReminder.js'

export default function handler(
  request: Request<unknown, unknown, UpdateOrganizationReminderForm>,
  response: Response
): void {
  const success = updateOrganizationReminder(request.body, request.session.user)

  if (success) {
    const reminder = getOrganizationReminder(
      request.body.organizationID,
      request.body.reminderIndex,
      request.session.user
    )

    response.json({
      success: true,
      reminder
    })
  } else {
    response.json({
      success: false
    })
  }
}
