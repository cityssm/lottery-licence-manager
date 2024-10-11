import type { Request, Response } from 'express'

import updateApplicationSetting from '../../helpers/licencesDB/updateApplicationSetting.js'

export interface DoSaveApplicationSettingResponse {
  success: boolean
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { settingKey: string; settingValue: string }
  >,
  response: Response<DoSaveApplicationSettingResponse>
): void {
  const settingKey = request.body.settingKey
  const settingValue = request.body.settingValue

  const success = updateApplicationSetting(
    settingKey,
    settingValue,
    request.session.user
  )

  response.json({
    success
  })
}
