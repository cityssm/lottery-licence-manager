import type * as expressSession from "express-session";
import type { LotteryLicenceForm } from "./updateLicence.js";
export declare const createLicence: (reqBody: LotteryLicenceForm, reqSession: expressSession.Session) => number;
export default createLicence;
