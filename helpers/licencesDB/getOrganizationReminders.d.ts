import sqlite from 'better-sqlite3';
import type { OrganizationReminder, User } from '../../types/recordTypes.js';
export declare function getOrganizationRemindersWithDB(database: sqlite.Database, organizationID: number | string, requestUser: User): OrganizationReminder[];
export default function getOrganizationReminders(organizationID: number | string, requestUser: User): OrganizationReminder[];
