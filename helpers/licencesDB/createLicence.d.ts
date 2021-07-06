import type * as expressSession from "express-session";
import type { LotteryLicenceForm } from "./updateLicence.js";
export declare const createLicence: (requestBody: LotteryLicenceForm, requestSession: expressSession.Session) => number;
export default createLicence;
