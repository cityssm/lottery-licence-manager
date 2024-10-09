import type * as configTypes from '../types/configTypes.js'

import { config as configOntario } from './configOntario.js'

export const config: configTypes.Config = { ...configOntario }

/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: 'Lottery Licence Manager',
  useTestDatabases: true
}

config.users = {
  testing: ['*testView', '*testUpdate', '*testAdmin'],
  canLogin: ['*testView', '*testUpdate', '*testAdmin'],
  canCreate: ['*testUpdate'],
  canUpdate: ['*testUpdate'],
  isAdmin: ['*testAdmin']
}

/*
 * DEFAULT VALUES
 */

config.defaults.city = ''

export default config
