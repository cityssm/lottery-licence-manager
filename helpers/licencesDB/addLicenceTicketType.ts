import sqlite from "better-sqlite3";

import type * as expressSession from "express-session";


export const addLicenceTicketTypeWithDB = (database: sqlite.Database,
  ticketTypeDefinition: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
    amendmentDate?: number | string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID?: number | string;
    manufacturerLocationID?: number | string;
  },
  requestSession: expressSession.Session): void => {

  const nowMillis = Date.now();

  database.prepare("insert into LotteryLicenceTicketTypes" +
    " (licenceID, ticketTypeIndex," +
    " amendmentDate, ticketType," +
    " unitCount, licenceFee," +
    " distributorLocationID, manufacturerLocationID," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      ticketTypeDefinition.licenceID,
      ticketTypeDefinition.ticketTypeIndex,
      ticketTypeDefinition.amendmentDate,
      ticketTypeDefinition.ticketType,
      ticketTypeDefinition.unitCount,
      ticketTypeDefinition.licenceFee,
      (ticketTypeDefinition.distributorLocationID === ""
        ? undefined
        : ticketTypeDefinition.distributorLocationID),

      (ticketTypeDefinition.manufacturerLocationID === ""
        ? undefined
        : ticketTypeDefinition.manufacturerLocationID),

      requestSession.user.userName,
      nowMillis,
      requestSession.user.userName,
      nowMillis
    );
};
