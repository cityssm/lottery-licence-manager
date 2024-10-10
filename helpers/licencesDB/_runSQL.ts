// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/filename-case */

import sqlite from 'better-sqlite3'
import debug from 'debug'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

const debugSQL = debug('lottery-licence-manager:licencesDB:runSQL')

export function runSQL(
  sql: string,
  parameters: unknown[] = []
): sqlite.RunResult | undefined {
  const database = sqlite(databasePath)

  try {
    return database.prepare(sql).run(...parameters)
  } catch (error) {
    debugSQL(error)
  } finally {
    try {
      database.close()
    } catch {
      // ignore
    }
  }
}

export function runSQL_hasChanges(
  sql: string,
  parameters: unknown[] = []
): boolean {
  const result = runSQL(sql, parameters)

  if (result !== undefined) {
    return result.changes > 0
  }

  return false
}
