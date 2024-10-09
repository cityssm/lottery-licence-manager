import type { Config } from '../types/configTypes.js'

import { config as configOntario } from './configOntario.js'

export const config: Config = { ...configOntario }

/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: 'Lottery Licence Manager'
}

config.users = {
  canLogin: [],
  canCreate: [],
  canUpdate: [],
  isAdmin: []
}

/*
 * DEFAULT VALUES
 */

config.defaults.city = ''

export default config
