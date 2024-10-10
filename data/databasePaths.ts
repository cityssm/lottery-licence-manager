import Debug from 'debug'

import * as configFunctions from '../helpers/functions.config.js'

const debug = Debug('lottery-licence-manager:databasePaths')

// Determine if test databases should be used

export const useTestDatabases =
  configFunctions.getProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const licencesDB_live = 'data/licences.db'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const licencesDB_testing = 'data/licences-testing.db'

export const licencesDB = useTestDatabases
  ? licencesDB_testing
  : licencesDB_live
