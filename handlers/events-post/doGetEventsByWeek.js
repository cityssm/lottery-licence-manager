import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getLicenceActivityByDateRange } from "../../helpers/licencesDB/getLicenceActivityByDateRange.js";
export const handler = (req, res) => {
    const dateWithinWeek = dateTimeFns.dateStringToDate(req.body.eventDate);
    dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay());
    const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    dateWithinWeek.setDate(dateWithinWeek.getDate() + 6);
    const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    const activity = getLicenceActivityByDateRange(startDateInteger, endDateInteger);
    res.json(activity);
};
export default handler;
