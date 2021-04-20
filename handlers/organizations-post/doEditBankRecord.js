import { updateOrganizationBankRecord } from "../../helpers/licencesDB/updateOrganizationBankRecord.js";
export const handler = (req, res) => {
    const success = updateOrganizationBankRecord(req.body, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Record updated successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Please try again."
        });
    }
};
export default handler;
