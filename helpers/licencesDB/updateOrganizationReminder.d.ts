import type { User } from '../../types/recordTypes.js';
export interface UpdateOrganizationReminderForm {
    organizationID: string;
    reminderIndex: string;
    reminderTypeKey: string;
    dueDateString?: string;
    reminderStatus: string;
    reminderNote: string;
    dismissedDateString: string;
}
export default function updateOrganizationReminder(requestBody: UpdateOrganizationReminderForm, requestUser: User): boolean;
