import mergeLocations from '../../helpers/licencesDB/mergeLocations.js';
export default function handler(request, response) {
    const targetLocationID = request.body.targetLocationID;
    const sourceLocationID = request.body.sourceLocationID;
    const success = mergeLocations(targetLocationID, sourceLocationID, request.session.user);
    response.json({
        success
    });
}
