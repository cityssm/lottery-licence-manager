import type { Request, Response } from 'express'

import { updateApplicationSetting } from '../../helpers/licencesDB/updateApplicationSetting.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { settingKey: string; settingValue: string }
  >,
  response: Response
): void {
  const settingKey = request.body.settingKey
  const settingValue = request.body.settingValue

  const success = updateApplicationSetting(
    settingKey,
    settingValue,
    request.session
  )

  response.json({
    success
  })
}
