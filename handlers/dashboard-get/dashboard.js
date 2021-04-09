"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getDashboardStats = require("../../helpers/licencesDB/getDashboardStats");
const handler = (_req, res) => {
    const stats = licencesDB_getDashboardStats.getDashboardStats();
    res.render("dashboard", {
        headTitle: "Dashboard",
        stats
    });
};
exports.handler = handler;
