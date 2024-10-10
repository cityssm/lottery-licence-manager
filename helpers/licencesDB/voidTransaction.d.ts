import type * as expressSession from 'express-session';
export default function voidTransaction(licenceID: number | string, transactionIndex: number | string, requestSession: expressSession.Session): boolean;
