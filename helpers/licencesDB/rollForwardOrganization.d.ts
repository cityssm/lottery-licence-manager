import type * as expressSession from "express-session";
interface RollForwardOrganizationReturn {
    success: boolean;
    message?: string;
}
export declare const rollForwardOrganization: (organizationID: number, updateFiscalYear: boolean, updateReminders: boolean, requestSession: expressSession.Session) => RollForwardOrganizationReturn;
export {};
