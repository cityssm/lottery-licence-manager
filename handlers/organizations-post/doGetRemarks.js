import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationRemarks(organizationID, req.session));
};
