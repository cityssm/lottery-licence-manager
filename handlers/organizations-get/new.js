import * as configFns from "../../helpers/configFns.js";
export const handler = (_request, response) => {
    response.render("organization-edit", {
        headTitle: "Organization Create",
        isViewOnly: false,
        isCreate: true,
        organization: {
            organizationCity: configFns.getProperty("defaults.city"),
            organizationProvince: configFns.getProperty("defaults.province")
        }
    });
};
export default handler;
