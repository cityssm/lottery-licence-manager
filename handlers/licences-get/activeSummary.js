"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../../helpers/licencesDB");
const handler = (_req, res) => {
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
exports.handler = handler;
