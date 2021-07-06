import { runSQLWithDB } from "../_runSQLByName.js";

import type * as expressSession from "express-session";
import type * as sqlite from "better-sqlite3";


export const deleteLicenceTicketTypeWithDB = (database: sqlite.Database,
  ticketTypeDefinition: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
  },
  requestSession: expressSession.Session): sqlite.RunResult => {

  return runSQLWithDB(database, "update LotteryLicenceTicketTypes" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and ticketTypeIndex = ?", [
      requestSession.user.userName,
      Date.now(),
      ticketTypeDefinition.licenceID,
      ticketTypeDefinition.ticketTypeIndex
    ]);
};
