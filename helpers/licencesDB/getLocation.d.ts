import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes.js';
export default function getLocation(locationID: number, requestSession: expressSession.Session): llm.Location | undefined;
