import { getInactiveOrganizations } from "../../helpers/licencesDB/getInactiveOrganizations.js";
export const handler = (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(getInactiveOrganizations(inactiveYears));
};
