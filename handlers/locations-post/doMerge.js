import { mergeLocations } from "../../helpers/licencesDB/mergeLocations.js";
export const handler = (req, res) => {
    const targetLocationID = req.body.targetLocationID;
    const sourceLocationID = req.body.sourceLocationID;
    const success = mergeLocations(targetLocationID, sourceLocationID, req.session);
    res.json({
        success
    });
};
export default handler;
