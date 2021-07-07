import { createOrganization } from "../../helpers/licencesDB/createOrganization.js";
import { updateOrganization } from "../../helpers/licencesDB/updateOrganization.js";
export const handler = (request, response) => {
    if (request.body.organizationID === "") {
        const newOrganizationID = createOrganization(request.body, request.session);
        return response.json({
            success: true,
            organizationID: newOrganizationID
        });
    }
    else {
        const success = updateOrganization(request.body, request.session);
        return success
            ? response.json({
                success: true,
                message: "Organization updated successfully."
            })
            : response.json({
                success: false,
                message: "Record Not Saved"
            });
    }
};
export default handler;
