import type { Request, Response } from 'express'

import createLicence from '../../helpers/licencesDB/createLicence.js'
import updateLicence, {
  type LotteryLicenceForm
} from '../../helpers/licencesDB/updateLicence.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    LotteryLicenceForm & { licenceID: string }
  >,
  response: Response<{ success: boolean; licenceID?: number; message?: string }>
): void {
  if (request.body.licenceID === '') {
    const newLicenceID = createLicence(request.body, request.session)

    response.json({
      success: true,
      licenceID: newLicenceID
    })
  } else {
    const changeCount = updateLicence(request.body, request.session)

    if (changeCount) {
      response.json({
        success: true,
        message: 'Licence updated successfully.'
      })
    } else {
      response.json({
        success: false,
        message: 'Record Not Saved'
      })
    }
  }
}
