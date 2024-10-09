import { Router } from 'express'

import handler_applicationSettings from '../handlers/admin-get/applicationSettings.js'
import handler_doSaveApplicationSetting from '../handlers/admin-post/doSaveApplicationSetting.js'
import * as permissionHandlers from '../handlers/permissions.js'

export const router = Router()

// Application Settings

router.get(
  '/applicationSettings',
  permissionHandlers.adminGetHandler,
  handler_applicationSettings
)

router.post(
  '/doSaveApplicationSetting',
  permissionHandlers.adminPostHandler,
  handler_doSaveApplicationSetting
)

export default router
