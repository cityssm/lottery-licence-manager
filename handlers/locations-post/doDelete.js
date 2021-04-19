import { deleteLocation } from "../../helpers/licencesDB/deleteLocation.js";
export const handler = (req, res) => {
    const changeCount = deleteLocation(req.body.locationID, req.session);
    if (changeCount) {
        return res.json({
            success: true,
            message: "Location deleted successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Location could not be deleted."
        });
    }
};
