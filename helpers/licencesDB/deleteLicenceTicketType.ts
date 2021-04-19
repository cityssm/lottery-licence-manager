import { runSQLWithDB } from "../_runSQLByName.js";

import type * as expressSession from "express-session";
import type * as sqlite from "better-sqlite3";


export const deleteLicenceTicketTypeWithDB = (db: sqlite.Database,
  ticketTypeDef: {
    licenceID: string | number;
    eventDate: number | string;
    ticketType: string;
  },
  reqSession: expressSession.Session) => {

  return runSQLWithDB(db, "update LotteryLicenceTicketTypes" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and ticketType = ?", [
      reqSession.user.userName,
      Date.now(),
      ticketTypeDef.licenceID,
      ticketTypeDef.eventDate,
      ticketTypeDef.ticketType
    ]);
};
