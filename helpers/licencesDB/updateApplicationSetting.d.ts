/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
export declare const updateApplicationSetting: (settingKey: string, settingValue: string, reqSession: Express.SessionData) => boolean;
