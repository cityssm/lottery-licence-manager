import { deleteOrganization } from "../../helpers/licencesDB/deleteOrganization.js";
export const handler = (req, res) => {
    const success = deleteOrganization(req.body.organizationID, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Organization deleted successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Organization could not be deleted."
        });
    }
};
