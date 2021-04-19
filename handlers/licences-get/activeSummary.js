import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
export const handler = (_req, res) => {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const startDate = new Date();
    startDate.setDate(1);
    const startDateStartString = dateTimeFns.dateToString(startDate);
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(0);
    const startDateEndString = dateTimeFns.dateToString(startDate);
    res.render("licence-activeSummary", {
        headTitle: "Active Licence Summary",
        startYearMin: (licenceTableStats.startYearMin || new Date().getFullYear()),
        startDateStartString,
        startDateEndString
    });
};
