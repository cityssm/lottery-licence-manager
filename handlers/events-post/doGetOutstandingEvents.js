import { getOutstandingEvents } from '../../helpers/licencesDB/getOutstandingEvents.js';
export default function handler(request, response) {
    const events = getOutstandingEvents(request.body, request.session);
    response.json(events);
}
