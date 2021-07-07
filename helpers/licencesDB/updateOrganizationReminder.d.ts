import type * as expressSession from "express-session";
export declare const updateOrganizationReminder: (requestBody: {
    organizationID: string;
    reminderIndex: string;
    reminderTypeKey: string;
    dueDateString?: string;
    reminderStatus: string;
    reminderNote: string;
    dismissedDateString: string;
}, requestSession: expressSession.Session) => boolean;
