import type * as sqlite from "better-sqlite3";


export const getMaxLicenceTicketTypeIndexWithDB = (db: sqlite.Database, licenceID: number | string) => {

  const result: {
    ticketTypeIndex: number;
  } = db.prepare("select ticketTypeIndex" +
    " from LotteryLicenceTicketTypes" +
    " where licenceID = ?" +
    " order by ticketTypeIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.ticketTypeIndex
    : -1);
};
