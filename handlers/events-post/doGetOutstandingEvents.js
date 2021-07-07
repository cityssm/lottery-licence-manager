import { getOutstandingEvents } from "../../helpers/licencesDB/getOutstandingEvents.js";
export const handler = (request, response) => {
    const events = getOutstandingEvents(request.body, request.session);
    response.json(events);
};
export default handler;
