import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes.js';
export declare function getEvent(licenceID: number, eventDate: number, requestSession: expressSession.Session): llm.LotteryEvent | undefined;
export default getEvent;
