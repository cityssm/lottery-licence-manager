import { getInactiveLocations } from "../../helpers/licencesDB/getInactiveLocations.js";
export const handler = (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(getInactiveLocations(inactiveYears));
};
