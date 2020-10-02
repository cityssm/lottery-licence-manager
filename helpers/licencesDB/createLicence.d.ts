/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type { LotteryLicenceForm } from "./updateLicence";
export declare const createLicence: (reqBody: LotteryLicenceForm, reqSession: Express.SessionData) => number;
