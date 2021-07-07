import { issueLicence } from "../../helpers/licencesDB/issueLicence.js";
export const handler = (request, response) => {
    const success = issueLicence(request.body.licenceID, request.session);
    if (success) {
        response.json({
            success: true,
            message: "Licence Issued Successfully"
        });
    }
    else {
        response.json({
            success: false,
            message: "Licence Not Issued"
        });
    }
};
export default handler;
