import { getApplicationSettings } from "../../helpers/licencesDB/getApplicationSettings.js";
export const handler = (_req, res) => {
    const applicationSettings = getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings
    });
};
