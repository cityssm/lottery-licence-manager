import { runSQLWithDB } from "../_runSQLByName.js";

import type * as expressSession from "express-session";
import type * as sqlite from "better-sqlite3";


export const deleteLicenceTicketTypeWithDB = (db: sqlite.Database,
  ticketTypeDef: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
  },
  reqSession: expressSession.Session) => {

  return runSQLWithDB(db, "update LotteryLicenceTicketTypes" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and ticketTypeIndex = ?", [
      reqSession.user.userName,
      Date.now(),
      ticketTypeDef.licenceID,
      ticketTypeDef.ticketTypeIndex
    ]);
};
