import * as reportFns from "../reportFns.js";
export const reports = {
    "ticketTypes-all": {
        sql: "select * from LotteryLicenceTicketTypes"
    },
    "ticketTypes-byLicence": {
        functions: () => {
            const func = new Map();
            func.set("userFn_ticketTypeField", reportFns.userFn_ticketTypeField);
            return func;
        },
        sql: "select t.licenceID, t.ticketTypeIndex," +
            " t.amendmentDate, t.ticketType," +
            " t.unitCount," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketPrice') * userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketCount') as valuePerDeal," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'prizesPerDeal') as prizesPerDeal," +
            " t.licenceFee," +
            " t.distributorLocationID," +
            " d.locationName as distributorLocationName," +
            " d.locationAddress1 as distributorAddress1," +
            " t.manufacturerLocationID," +
            " m.locationName as manufacturerLocationName," +
            " m.locationAddress1 as manufacturerLocationAddress1," +
            " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
            " from LotteryLicenceTicketTypes t" +
            " left join LotteryLicences l on t.licenceID = l.licenceID" +
            " left join Locations d on distributorLocationID = d.locationID" +
            " left join Locations m on manufacturerLocationID = m.locationID" +
            " where t.recordDelete_timeMillis is null" +
            " and t.licenceID = ?",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
