import { updateOrganizationRepresentative } from "../../helpers/licencesDB/updateOrganizationRepresentative.js";
export const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    if (isNaN(organizationID)) {
        return next();
    }
    const representativeObj = updateOrganizationRepresentative(organizationID, req.body);
    if (representativeObj) {
        res.json({
            success: true,
            organizationRepresentative: representativeObj
        });
    }
    else {
        res.json({
            success: false
        });
    }
};
