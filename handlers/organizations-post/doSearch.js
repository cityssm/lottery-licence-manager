import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";
export const handler = (req, res) => {
    res.json(getOrganizations(req.body, req.session, {
        limit: 100,
        offset: 0
    }));
};
