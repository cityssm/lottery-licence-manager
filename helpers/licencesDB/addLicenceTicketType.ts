import sqlite from "better-sqlite3";

import type * as expressSession from "express-session";


export const addLicenceTicketTypeWithDB = (db: sqlite.Database,
  ticketTypeDef: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
    amendmentDate?: number | string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID?: number | string;
    manufacturerLocationID?: number | string;
  },
  reqSession: expressSession.Session) => {

  const nowMillis = Date.now();

  db.prepare("insert into LotteryLicenceTicketTypes" +
    " (licenceID, ticketTypeIndex," +
    " amendmentDate, ticketType," +
    " unitCount, licenceFee," +
    " distributorLocationID, manufacturerLocationID," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      ticketTypeDef.licenceID,
      ticketTypeDef.ticketTypeIndex,
      ticketTypeDef.amendmentDate,
      ticketTypeDef.ticketType,
      ticketTypeDef.unitCount,
      ticketTypeDef.licenceFee,
      (ticketTypeDef.distributorLocationID === ""
        ? null
        : ticketTypeDef.distributorLocationID),

      (ticketTypeDef.manufacturerLocationID === ""
        ? null
        : ticketTypeDef.manufacturerLocationID),

      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );
};
