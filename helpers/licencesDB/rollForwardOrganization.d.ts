import type * as expressSession from "express-session";
export declare const rollForwardOrganization: (organizationID: number, updateFiscalYear: boolean, updateReminders: boolean, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
