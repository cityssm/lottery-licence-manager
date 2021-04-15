import * as sqlite from "better-sqlite3";

import type * as llm from "../../types/recordTypes";


export const getLicenceTicketTypesWithDB = (db: sqlite.Database, licenceID: number | string) => {

  const ticketTypesList: llm.LotteryLicenceTicketType[] = db.prepare("select t.ticketTypeIndex, t.ticketType," +
    " t.distributorLocationID," +
    " d.locationName as distributorLocationName, d.locationAddress1 as distributorLocationAddress1," +
    " t.manufacturerLocationID," +
    " m.locationName as manufacturerLocationName, m.locationAddress1 as manufacturerLocationAddress1," +
    " t.unitCount," +
    " ifnull(t.licenceFee, 0) as licenceFee" +
    " from LotteryLicenceTicketTypes t" +
    " left join Locations d on t.distributorLocationID = d.locationID" +
    " left join Locations m on t.manufacturerLocationID = m.locationID" +
    " where t.recordDelete_timeMillis is null" +
    " and t.licenceID = ?" +
    " order by t.ticketTypeIndex")
    .all(licenceID);

  for (const ticketTypeObj of ticketTypesList) {

    ticketTypeObj.distributorLocationDisplayName = ticketTypeObj.distributorLocationName === ""
      ? ticketTypeObj.distributorLocationAddress1
      : ticketTypeObj.distributorLocationName;

    ticketTypeObj.manufacturerLocationDisplayName = ticketTypeObj.manufacturerLocationName === ""
      ? ticketTypeObj.manufacturerLocationAddress1
      : ticketTypeObj.manufacturerLocationName;
  }

  return ticketTypesList;
};
