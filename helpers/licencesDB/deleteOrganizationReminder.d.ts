import sqlite from 'better-sqlite3';
import type { User } from '../../types/recordTypes.js';
export declare function deleteOrganizationReminderWithDB(database: sqlite.Database, organizationID: number | string, reminderIndex: number | string, requestUser: User): boolean;
export default function deleteOrganizationReminder(organizationID: number | string, reminderIndex: number | string, requestUser: User): boolean;
