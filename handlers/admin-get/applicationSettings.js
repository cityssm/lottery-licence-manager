"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getApplicationSettings = require("../../helpers/licencesDB/getApplicationSettings");
exports.handler = (_req, res) => {
    const applicationSettings = licencesDB_getApplicationSettings.getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings
    });
};
