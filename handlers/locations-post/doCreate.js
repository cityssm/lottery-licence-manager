import { createLocation } from "../../helpers/licencesDB/createLocation.js";
export const handler = (request, response) => {
    const locationID = createLocation(request.body, request.session);
    return response.json({
        success: true,
        locationID,
        locationDisplayName: (request.body.locationName === "" ? request.body.locationAddress1 : request.body.locationName)
    });
};
export default handler;
