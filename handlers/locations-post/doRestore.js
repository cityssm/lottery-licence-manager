import { restoreLocation } from "../../helpers/licencesDB/restoreLocation.js";
export const handler = (req, res) => {
    const changeCount = restoreLocation(req.body.locationID, req.session);
    if (changeCount) {
        return res.json({
            success: true,
            message: "Location restored successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Location could not be restored."
        });
    }
};
export default handler;
