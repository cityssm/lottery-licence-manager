import { updateOrganizationBankRecord } from "../../helpers/licencesDB/updateOrganizationBankRecord.js";
export const handler = (request, response) => {
    const success = updateOrganizationBankRecord(request.body, request.session);
    return success
        ? response.json({
            success: true,
            message: "Record updated successfully."
        })
        : response.json({
            success: false,
            message: "Please try again."
        });
};
export default handler;
