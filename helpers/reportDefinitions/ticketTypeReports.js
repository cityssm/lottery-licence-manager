import * as reportFns from "../reportFns.js";
const baseFunctions = () => {
    const func = new Map();
    func.set("userFn_ticketTypeField", reportFns.userFn_ticketTypeField);
    return func;
};
export const reports = {
    "ticketTypes-all": {
        sql: "select * from LotteryLicenceTicketTypes"
    },
    "ticketTypes-formatted": {
        functions: baseFunctions,
        sql: "select t.licenceID, l.externalLicenceNumber," +
            " o.organizationName," +
            " t.amendmentDate, t.ticketType," +
            " t.unitCount," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketPrice') * userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketCount') as valuePerDeal," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'prizesPerDeal') as prizesPerDeal," +
            " t.licenceFee," +
            " d.locationName as distributorLocationName," +
            " d.locationAddress1 as distributorAddress1," +
            " m.locationName as manufacturerLocationName," +
            " m.locationAddress1 as manufacturerLocationAddress1" +
            " from LotteryLicenceTicketTypes t" +
            " left join LotteryLicences l on t.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " left join Locations d on distributorLocationID = d.locationID" +
            " left join Locations m on manufacturerLocationID = m.locationID" +
            " where t.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null"
    },
    "ticketTypes-byLicence": {
        functions: baseFunctions,
        sql: "select t.licenceID, l.externalLicenceNumber," +
            " t.amendmentDate, t.ticketType," +
            " t.unitCount," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketPrice') * userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketCount') as valuePerDeal," +
            " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'prizesPerDeal') as prizesPerDeal," +
            " t.licenceFee," +
            " d.locationName as distributorLocationName," +
            " d.locationAddress1 as distributorAddress1," +
            " m.locationName as manufacturerLocationName," +
            " m.locationAddress1 as manufacturerLocationAddress1" +
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
