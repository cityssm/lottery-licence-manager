import { getApplicationSettings } from "../../helpers/licencesDB/getApplicationSettings.js";
export const handler = (_request, response) => {
    const applicationSettings = getApplicationSettings();
    response.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings
    });
};
export default handler;
