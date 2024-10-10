import type * as expressSession from 'express-session';
import type { Location } from '../../types/recordTypes.js';
export default function getLocation(locationID: number, requestSession: expressSession.Session): Location | undefined;
