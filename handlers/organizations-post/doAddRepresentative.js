import { addOrganizationRepresentative } from "../../helpers/licencesDB/addOrganizationRepresentative.js";
export const handler = (request, response, next) => {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        return next();
    }
    const representativeObject = addOrganizationRepresentative(organizationID, request.body);
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
