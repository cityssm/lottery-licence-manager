import getEvents from '../../helpers/licencesDB/getEvents.js';
export default function handler(request, response) {
    response.json(getEvents(request.body, request.session.user, {
        limit: Number.parseInt(request.body.limit, 10),
        offset: Number.parseInt(request.body.offset, 10)
    }));
}
