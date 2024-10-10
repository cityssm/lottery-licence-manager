import type sqlite from 'better-sqlite3'

export function getMaxOrganizationReminderIndexWithDB(
  database: sqlite.Database,
  organizationID: number | string
): number {
  const result = database
    .prepare(
      `select reminderIndex
        from OrganizationReminders
        where organizationID = ?
        order by reminderIndex desc
        limit 1`
    )
    .get(organizationID) as
    | {
        reminderIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.reminderIndex
}
