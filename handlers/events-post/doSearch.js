import { getEvents } from "../../helpers/licencesDB/getEvents.js";
export const handler = (request, response) => {
    response.json(getEvents(request.body, request.session));
};
export default handler;
