import * as sqlite from "better-sqlite3";

import type * as expressSession from "express-session";


export const deleteLicenceTicketTypeWithDB = (db: sqlite.Database,
  ticketTypeDef: {
    licenceID: string | number;
    eventDate: number | string;
    ticketType: string;
  },
  reqSession: expressSession.Session) => {

  const nowMillis = Date.now();

  db.prepare("update LotteryLicenceTicketTypes" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and ticketType = ?")
    .run(
      reqSession.user.userName,
      nowMillis,
      ticketTypeDef.licenceID,
      ticketTypeDef.eventDate,
      ticketTypeDef.ticketType
    );
};
