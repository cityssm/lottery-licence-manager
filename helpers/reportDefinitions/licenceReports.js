import * as reportFns from "../reportFns.js";
const baseFunctions = () => {
    const func = new Map();
    func.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
    return func;
};
const baseSQL = "select" +
    " l.licenceID, l.externalLicenceNumber," +
    " o.organizationID, o.organizationName," +
    " l.applicationDate," +
    " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
    " l.startDate, l.endDate, l.startTime, l.endTime," +
    " lo.locationName, lo.locationAddress1," +
    " l.municipality, l.licenceDetails, l.termsConditions," +
    " l.totalPrizeValue, l.licenceFee, l.issueDate," +
    " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
    " from LotteryLicences l" +
    " left join Locations lo on l.locationID = lo.locationID" +
    " left join Organizations o on l.organizationID = o.organizationID" +
    " where l.recordDelete_timeMillis is null";
export const reports = {
    "licences-all": {
        sql: "select * from LotteryLicences"
    },
    "licences-notIssued": {
        functions: baseFunctions,
        sql: baseSQL + " and l.issueDate is null"
    },
    "licences-formatted": {
        functions: baseFunctions,
        sql: baseSQL
    },
    "licences-byOrganization": {
        functions: baseFunctions,
        sql: baseSQL + " and l.organizationID = ?",
        params: (req) => [req.query.organizationID]
    },
    "licences-byLocation": {
        functions: baseFunctions,
        sql: baseSQL + " and l.locationID = ?",
        params: (req) => [req.query.locationID]
    }
};
export default reports;
