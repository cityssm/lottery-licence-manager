import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

interface GetApplicationSettingsReturn {
  settingKey: string
  settingName: string
  settingDescription?: string
  settingValue?: string
  orderNumber: number
  recordUpdate_userName: string
  recordUpdate_timeMillis: number
}

export default function getApplicationSettings(): GetApplicationSettingsReturn[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      'select * from ApplicationSettings order by orderNumber, settingKey'
    )
    .all() as GetApplicationSettingsReturn[]

  database.close()

  return rows
}
