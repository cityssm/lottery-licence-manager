import { createLocation } from "../../helpers/licencesDB/createLocation.js";
export const handler = (req, res) => {
    const locationID = createLocation(req.body, req.session);
    return res.json({
        success: true,
        locationID,
        locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
    });
};
