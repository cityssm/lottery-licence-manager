import { getOutstandingEvents } from "../../helpers/licencesDB/getOutstandingEvents.js";
export const handler = (req, res) => {
    const events = getOutstandingEvents(req.body, req.session);
    res.json(events);
};
export default handler;
