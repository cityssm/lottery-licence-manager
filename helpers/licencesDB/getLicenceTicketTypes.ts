import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";


export const getLicenceTicketTypesWithDB = (db: sqlite.Database, licenceID: number | string) => {

  db.function("userFn_dateIntegerToString", dateTimeFns.dateIntegerToString);

  const ticketTypesList: llm.LotteryLicenceTicketType[] = db.prepare(
    "select t.ticketTypeIndex," +
    " t.amendmentDate," +
    " userFn_dateIntegerToString(t.amendmentDate) as amendmentDateString," +
    " t.ticketType," +
    " t.distributorLocationID," +
    " d.locationName as distributorLocationName," +
    " d.locationAddress1 as distributorLocationAddress1," +
    " iif(d.locationName = '', d.locationAddress1, d.locationName) as distributorLocationDisplayName," +
    " t.manufacturerLocationID," +
    " m.locationName as manufacturerLocationName," +
    " m.locationAddress1 as manufacturerLocationAddress1," +
    " iif(m.locationName = '', m.locationAddress1, m.locationName) as manufacturerLocationDisplayName," +
    " t.unitCount," +
    " ifnull(t.licenceFee, 0) as licenceFee" +
    " from LotteryLicenceTicketTypes t" +
    " left join Locations d on t.distributorLocationID = d.locationID" +
    " left join Locations m on t.manufacturerLocationID = m.locationID" +
    " where t.recordDelete_timeMillis is null" +
    " and t.licenceID = ?" +
    " order by t.ticketTypeIndex")
    .all(licenceID);

  return ticketTypesList;
};
