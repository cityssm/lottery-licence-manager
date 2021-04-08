"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicenceActivityByDateRange_1 = require("../../helpers/licencesDB/getLicenceActivityByDateRange");
const handler = (req, res) => {
    const dateWithinWeek = dateTimeFns.dateStringToDate(req.body.eventDate);
    dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay());
    const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    dateWithinWeek.setDate(dateWithinWeek.getDate() + 6);
    const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    const activity = getLicenceActivityByDateRange_1.getLicenceActivityByDateRange(startDateInteger, endDateInteger);
    res.json(activity);
};
exports.handler = handler;
