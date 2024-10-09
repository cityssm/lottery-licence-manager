import type * as expressSession from 'express-session';
export default function deleteEvent(licenceID: number | string, eventDate: number | string, requestSession: expressSession.Session): boolean;
