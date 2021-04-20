import { setDefaultOrganizationRepresentative } from "../../helpers/licencesDB/setDefaultOrganizationRepresentative.js";
export const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    const isDefaultRepresentativeIndex = Number(req.body.isDefaultRepresentativeIndex);
    if (isNaN(organizationID) || isNaN(isDefaultRepresentativeIndex)) {
        return next();
    }
    const success = setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success
    });
};
export default handler;
