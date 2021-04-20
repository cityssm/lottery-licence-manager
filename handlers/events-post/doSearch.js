import { getEvents } from "../../helpers/licencesDB/getEvents.js";
export const handler = (req, res) => {
    res.json(getEvents(req.body, req.session));
};
export default handler;
