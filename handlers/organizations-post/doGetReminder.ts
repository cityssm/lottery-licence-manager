import type { Request, Response } from 'express'

import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js'

interface DoGetReminderRequest {
  organizationID: string
  reminderIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoGetReminderRequest>,
  response: Response
): void {
  const organizationID = request.body.organizationID
  const reminderIndex = request.body.reminderIndex

  response.json(
    getOrganizationReminder(organizationID, reminderIndex, request.session.user)
  )
}
