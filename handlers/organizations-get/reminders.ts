import type { Request, Response } from 'express'

import getUndismissedOrganizationReminders from '../../helpers/licencesDB/getUndismissedOrganizationReminders.js'

export default function handler(request: Request, response: Response): void {
  const reminders = getUndismissedOrganizationReminders(request.session.user)

  response.render('organization-reminders', {
    headTitle: 'Organization Reminders',
    reminders
  })
}
