import type { LotteryLicenceForm } from "./updateLicence";
import type * as expressSession from "express-session";
export declare const createLicence: (reqBody: LotteryLicenceForm, reqSession: expressSession.Session) => number;
