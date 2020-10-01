/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
export declare const rollForwardOrganization: (organizationID: number, updateFiscalYear: boolean, updateReminders: boolean, reqSession: Express.SessionData) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
