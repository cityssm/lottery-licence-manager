import { unissueLicence } from "../../helpers/licencesDB/unissueLicence.js";
export const handler = (req, res) => {
    const success = unissueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Unissued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Unissued"
        });
    }
};
