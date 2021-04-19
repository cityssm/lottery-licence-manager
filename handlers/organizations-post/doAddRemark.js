import { addOrganizationRemark } from "../../helpers/licencesDB/addOrganizationRemark.js";
export const handler = (req, res) => {
    const remarkIndex = addOrganizationRemark(req.body, req.session);
    return res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex
    });
};
