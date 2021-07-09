import * as configFunctions from "../../helpers/functions.config.js";
export const handler = (_request, response) => {
    response.render("organization-edit", {
        headTitle: "Organization Create",
        isViewOnly: false,
        isCreate: true,
        organization: {
            organizationCity: configFunctions.getProperty("defaults.city"),
            organizationProvince: configFunctions.getProperty("defaults.province")
        }
    });
};
export default handler;
