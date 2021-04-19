import * as licencesDB_getDashboardStats from "../../helpers/licencesDB/getDashboardStats.js";
export const handler = (_req, res) => {
    const stats = licencesDB_getDashboardStats.getDashboardStats();
    res.render("dashboard", {
        headTitle: "Dashboard",
        stats
    });
};
