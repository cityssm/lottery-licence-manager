import { updateOrganizationRepresentative } from "../../helpers/licencesDB/updateOrganizationRepresentative.js";
export const handler = (request, response, next) => {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        return next();
    }
    const representativeObject = updateOrganizationRepresentative(organizationID, request.body);
    return representativeObject
        ? response.json({
            success: true,
            organizationRepresentative: representativeObject
        })
        : response.json({
            success: false
        });
};
export default handler;
