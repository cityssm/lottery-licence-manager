import type { Request, Response } from 'express'

import updateEvent, {
  type UpdateEventForm
} from '../../helpers/licencesDB/updateEvent.js'

export default function handler(request: Request, response: Response): void {
  const changeCount = updateEvent(
    request.body as UpdateEventForm,
    request.session
  )

  if (changeCount) {
    response.json({
      success: true,
      message: 'Event updated successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Record Not Saved'
    })
  }
}
