import type * as expressSession from "express-session";
export declare const updateOrganizationReminder: (reqBody: {
    organizationID: string;
    reminderIndex: string;
    reminderTypeKey: string;
    reminderDateString?: string;
    reminderStatus: string;
    reminderNote: string;
    dismissedDateString: string;
}, reqSession: expressSession.Session) => boolean;
