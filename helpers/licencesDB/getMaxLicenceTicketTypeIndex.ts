import type * as sqlite from "better-sqlite3";


export const getMaxLicenceTicketTypeIndexWithDB = (database: sqlite.Database, licenceID: number | string): number => {

  const result: {
    ticketTypeIndex: number;
  } = database.prepare("select ticketTypeIndex" +
    " from LotteryLicenceTicketTypes" +
    " where licenceID = ?" +
    " order by ticketTypeIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.ticketTypeIndex
    : -1);
};
