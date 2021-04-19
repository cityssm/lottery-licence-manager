import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";
export const handler = (req, res) => {
    res.json(getOrganizations({}, req.session, {
        limit: -1
    }));
};
