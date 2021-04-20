import { issueLicence } from "../../helpers/licencesDB/issueLicence.js";
export const handler = (req, res) => {
    const success = issueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Issued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Issued"
        });
    }
};
export default handler;
