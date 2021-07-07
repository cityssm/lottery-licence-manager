import { setDefaultOrganizationRepresentative } from "../../helpers/licencesDB/setDefaultOrganizationRepresentative.js";
export const handler = (request, response, next) => {
    const organizationID = Number(request.params.organizationID);
    const isDefaultRepresentativeIndex = Number(request.body.isDefaultRepresentativeIndex);
    if (Number.isNaN(organizationID) || Number.isNaN(isDefaultRepresentativeIndex)) {
        return next();
    }
    const success = setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    response.json({
        success
    });
};
export default handler;
