import sqlite from 'better-sqlite3';
import type { OrganizationReminder, User } from '../../types/recordTypes';
export interface ReminderData {
    organizationID: string;
    reminderTypeKey: string;
    dueDateString?: string;
    reminderStatus: string;
    reminderNote: string;
}
export declare function addOrganizationReminderWithDB(database: sqlite.Database, reminderData: ReminderData, requestUser: User): OrganizationReminder;
export default function addOrganizationReminder(requestBody: ReminderData, requestUser: User): OrganizationReminder;
