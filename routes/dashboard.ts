import { Router } from 'express'

import handler_dashboard from '../handlers/dashboard-get/dashboard.js'
import handler_doGetDefaultConfigProperties from '../handlers/dashboard-post/doGetDefaultConfigProperties.js'

export const router = Router()

router.get('/', handler_dashboard)

router.all(
  '/doGetDefaultConfigProperties',
  handler_doGetDefaultConfigProperties
)

export default router
