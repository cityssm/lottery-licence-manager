import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const reports = {
    "events-all": {
        sql: "select * from LotteryEvents"
    },
    "events-upcoming": {
        sql: "select e.licenceID," +
            " e.eventDate, l.startTime, l.endTime," +
            " l.externalLicenceNumber, o.organizationName," +
            " l.licenceTypeKey, l.licenceDetails" +
            " from LotteryEvents e" +
            " left join LotteryLicences l on e.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where e.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null" +
            " and e.eventDate >= ?",
        params: () => [dateTimeFns.dateToInteger(new Date())]
    },
    "events-pastUnreported": {
        sql: "select e.licenceID, e.eventDate, e.reportDate," +
            " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
            " l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
            " o.organizationID, o.organizationName," +
            " o.organizationAddress1, o.organizationAddress2," +
            " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
            " r.representativeName, r.representativeTitle, r.representativeAddress1, r.representativeAddress2," +
            " r.representativeCity, r.representativeProvince, r.representativePostalCode," +
            " r.representativePhoneNumber, r.representativeEmailAddress" +
            " from LotteryEvents e" +
            " left join LotteryLicences l on e.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
            " where e.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null" +
            " and e.eventDate < ?" +
            " and (e.reportDate is null or e.reportDate = 0)",
        params: () => [dateTimeFns.dateToInteger(new Date())]
    },
    "events-byLicence": {
        sql: "select e.licenceID, l.externalLicenceNumber, e.eventDate," +
            " o.organizationName," +
            " l.startDate, l.endDate, l.startTime, l.endTime," +
            " lo.locationName, lo.locationAddress1, l.licenceDetails, l.licenceTypeKey," +
            " l.totalPrizeValue, l.licenceFee," +
            " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
            " e.costs_amountDonated" +
            " from LotteryEvents e" +
            " left join LotteryLicences l on e.licenceID = l.licenceID" +
            " left join Locations lo on l.locationID = lo.locationID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where e.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null" +
            " and e.licenceID = ?",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
