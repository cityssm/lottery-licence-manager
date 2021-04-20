import { getLicences } from "../../helpers/licencesDB/getLicences.js";
export const handler = (req, res) => {
    res.json(getLicences(req.body, req.session, {
        includeOrganization: true,
        limit: req.body.limit,
        offset: req.body.offset
    }));
};
export default handler;
