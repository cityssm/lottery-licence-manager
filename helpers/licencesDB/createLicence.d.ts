import type * as expressSession from 'express-session';
import type { LotteryLicenceForm } from './updateLicence.js';
export default function createLicence(requestBody: LotteryLicenceForm, requestSession: expressSession.Session): number;
