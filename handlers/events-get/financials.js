import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
export const handler = (_req, res) => {
    const eventTableStats = licencesDB.getEventTableStats();
    const eventDate = new Date();
    eventDate.setMonth(eventDate.getMonth() - 1);
    eventDate.setDate(1);
    const eventDateStartString = dateTimeFns.dateToString(eventDate);
    eventDate.setMonth(eventDate.getMonth() + 1);
    eventDate.setDate(0);
    const eventDateEndString = dateTimeFns.dateToString(eventDate);
    res.render("event-financials", {
        headTitle: "Financial Summary",
        pageContainerIsFullWidth: true,
        eventYearMin: (eventTableStats.eventYearMin || new Date().getFullYear() + 1),
        eventDateStartString,
        eventDateEndString
    });
};
export default handler;
