import { deleteOrganization } from "../../helpers/licencesDB/deleteOrganization.js";
export const handler = (request, response) => {
    const success = deleteOrganization(request.body.organizationID, request.session);
    return success
        ? response.json({
            success: true,
            message: "Organization deleted successfully."
        })
        : response.json({
            success: false,
            message: "Organization could not be deleted."
        });
};
export default handler;
