import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as reportFns from "../reportFns.js";
const baseFunctions = () => {
    const functions = new Map();
    functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
    return functions;
};
export const reports = {
    "events-all": {
        sql: "select * from LotteryEvents"
    },
    "events-upcoming": {
        functions: baseFunctions,
        sql: "select e.licenceID, l.externalLicenceNumber," +
            " o.organizationName," +
            " e.eventDate, l.startTime, l.endTime," +
            " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
            " l.licenceDetails" +
            " from LotteryEvents e" +
            " left join LotteryLicences l on e.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where e.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null" +
            " and e.eventDate >= ?",
        params: () => [dateTimeFns.dateToInteger(new Date())]
    },
    "events-pastUnreported": {
        functions: baseFunctions,
        sql: "select e.licenceID, l.externalLicenceNumber," +
            " e.eventDate, e.reportDate," +
            " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
            " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
            " l.licenceDetails," +
            " o.organizationName," +
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
        functions: () => {
            const functions = new Map();
            functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
            return functions;
        },
        sql: "select e.licenceID, l.externalLicenceNumber, e.eventDate," +
            " o.organizationName," +
            " l.startDate, l.endDate, l.startTime, l.endTime," +
            " lo.locationName, lo.locationAddress1, l.licenceDetails," +
            " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
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
        params: (request) => [request.query.licenceID]
    }
};
export default reports;
