import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const updateLicenceTicketTypeWithDB = (db: sqlite.Database,
  ticketTypeDef: {
    licenceID: number | string;
    eventDateString: string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID: number | string;
    manufacturerLocationID: number | string;
  },
  reqSession: expressSession.Session) => {

  const nowMillis = Date.now();

  db.prepare("update LotteryLicenceTicketTypes" +
    " set distributorLocationID = ?," +
    " manufacturerLocationID = ?," +
    " unitCount = ?," +
    " licenceFee = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and ticketType = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      (ticketTypeDef.distributorLocationID === ""
        ? null
        : ticketTypeDef.distributorLocationID),

      (ticketTypeDef.manufacturerLocationID === ""
        ? null
        : ticketTypeDef.manufacturerLocationID),

      ticketTypeDef.unitCount,
      ticketTypeDef.licenceFee,
      reqSession.user.userName,
      nowMillis,
      ticketTypeDef.licenceID,
      dateTimeFns.dateStringToInteger(ticketTypeDef.eventDateString),
      ticketTypeDef.ticketType
    );
};
