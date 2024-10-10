import getLicences from '../../helpers/licencesDB/getLicences.js';
export default function handler(request, response) {
    response.json(getLicences(request.body, request.session.user, {
        includeOrganization: true,
        limit: Number.parseInt(request.body.limit, 10),
        offset: Number.parseInt(request.body.offset, 10)
    }));
}
