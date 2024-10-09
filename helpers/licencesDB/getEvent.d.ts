import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes.js';
export default function getEvent(licenceID: number, eventDate: number, requestSession: expressSession.Session): llm.LotteryEvent | undefined;
