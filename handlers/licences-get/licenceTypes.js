"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../../helpers/licencesDB");
exports.handler = (_req, res) => {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const applicationDate = new Date();
    applicationDate.setMonth(applicationDate.getMonth() - 1);
    applicationDate.setDate(1);
    const applicationDateStartString = dateTimeFns.dateToString(applicationDate);
    applicationDate.setMonth(applicationDate.getMonth() + 1);
    applicationDate.setDate(0);
    const applicationDateEndString = dateTimeFns.dateToString(applicationDate);
    res.render("licence-licenceType", {
        headTitle: "Licence Type Summary",
        applicationYearMin: (licenceTableStats.applicationYearMin || new Date().getFullYear()),
        applicationDateStartString,
        applicationDateEndString
    });
};
