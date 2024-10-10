import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

type ApplicationSettingKey =
  | 'licences.externalLicenceNumber.range.start'
  | 'licences.externalLicenceNumber.range.end'

export function getApplicationSettingWithDB(
  database: sqlite.Database,
  settingKey: ApplicationSettingKey
): string {
  const row = database
    .prepare(
      'select settingValue' +
        ' from ApplicationSettings' +
        ' where settingKey = ?'
    )
    .get(settingKey) as { settingValue?: string } | undefined

  if (row) {
    return row.settingValue ?? ''
  }

  return ''
}

export default function getApplicationSetting(
  settingKey: ApplicationSettingKey
): string {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const settingValue = getApplicationSettingWithDB(database, settingKey)

  database.close()

  return settingValue
}
