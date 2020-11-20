"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getApplicationSettings_1 = require("../../helpers/licencesDB/getApplicationSettings");
const handler = (_req, res) => {
    const applicationSettings = getApplicationSettings_1.getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings
    });
};
exports.handler = handler;
