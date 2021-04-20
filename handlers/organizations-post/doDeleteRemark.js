import { deleteOrganizationRemark } from "../../helpers/licencesDB/deleteOrganizationRemark.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    const success = deleteOrganizationRemark(organizationID, remarkIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Remark deleted successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Remark could not be deleted."
        });
    }
};
export default handler;
