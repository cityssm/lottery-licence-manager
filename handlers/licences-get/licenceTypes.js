import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
export const handler = (_request, response) => {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const applicationDate = new Date();
    applicationDate.setMonth(applicationDate.getMonth() - 1);
    applicationDate.setDate(1);
    const applicationDateStartString = dateTimeFns.dateToString(applicationDate);
    applicationDate.setMonth(applicationDate.getMonth() + 1);
    applicationDate.setDate(0);
    const applicationDateEndString = dateTimeFns.dateToString(applicationDate);
    response.render("licence-licenceType", {
        headTitle: "Licence Type Summary",
        applicationYearMin: (licenceTableStats.applicationYearMin || new Date().getFullYear()),
        applicationDateStartString,
        applicationDateEndString
    });
};
export default handler;
