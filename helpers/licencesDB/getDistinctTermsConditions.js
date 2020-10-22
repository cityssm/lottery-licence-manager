"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctTermsConditions = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.getDistinctTermsConditions = (organizationID) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const terms = db.prepare("select termsConditions," +
        " count(licenceID) as termsConditionsCount," +
        " max(case when l.issueDate is null then 0 else 1 end) as isIssued," +
        " max(startDate) as startDateMax" +
        " from LotteryLicences l" +
        " where l.organizationID = ?" +
        " and l.termsConditions is not null and trim(l.termsConditions) <> ''" +
        " and l.recordDelete_timeMillis is null" +
        " group by l.termsConditions" +
        " order by startDateMax desc")
        .all(organizationID);
    db.close();
    for (const term of terms) {
        term.startDateMaxString = dateTimeFns.dateIntegerToString(term.startDateMax);
    }
    return terms;
};
