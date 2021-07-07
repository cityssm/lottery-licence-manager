import { restoreLocation } from "../../helpers/licencesDB/restoreLocation.js";
export const handler = (request, response) => {
    const changeCount = restoreLocation(request.body.locationID, request.session);
    return changeCount
        ? response.json({
            success: true,
            message: "Location restored successfully."
        })
        : response.json({
            success: false,
            message: "Location could not be restored."
        });
};
export default handler;
