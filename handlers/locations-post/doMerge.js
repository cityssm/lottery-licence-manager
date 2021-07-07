import { mergeLocations } from "../../helpers/licencesDB/mergeLocations.js";
export const handler = (request, response) => {
    const targetLocationID = request.body.targetLocationID;
    const sourceLocationID = request.body.sourceLocationID;
    const success = mergeLocations(targetLocationID, sourceLocationID, request.session);
    response.json({
        success
    });
};
export default handler;
