"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../../helpers/licencesDB");
const handler = (_req, res) => {
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
exports.handler = handler;
