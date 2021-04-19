import { deleteOrganizationRepresentative } from "../../helpers/licencesDB/deleteOrganizationRepresentative.js";
export const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    const representativeIndex = Number(req.body.representativeIndex);
    if (isNaN(organizationID) || isNaN(representativeIndex)) {
        return next();
    }
    const success = deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success
    });
};
