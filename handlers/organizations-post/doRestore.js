import { restoreOrganization } from "../../helpers/licencesDB/restoreOrganization.js";
export const handler = (request, response) => {
    const success = restoreOrganization(request.body.organizationID, request.session);
    return success
        ? response.json({
            success: true,
            message: "Organization restored successfully."
        })
        : response.json({
            success: false,
            message: "Organization could not be restored."
        });
};
export default handler;
