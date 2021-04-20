import { getDeletedOrganizations } from "../../helpers/licencesDB/getDeletedOrganizations.js";
export const handler = (_req, res) => {
    const organizations = getDeletedOrganizations();
    res.render("organization-recovery", {
        headTitle: "Organization Recovery",
        organizations
    });
};
export default handler;
