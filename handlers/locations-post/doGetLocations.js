import getLocations from '../../helpers/licencesDB/getLocations.js';
export default function handler(request, response) {
    const locations = getLocations(request.session, {
        limit: Number.parseInt(request.body.limit, 10),
        offset: Number.parseInt(request.body.offset, 10),
        locationNameAddress: request.body.locationNameAddress,
        locationIsDistributor: request.body.locationIsDistributor === ''
            ? -1
            : Number.parseInt(request.body.locationIsDistributor, 10),
        locationIsManufacturer: request.body.locationIsManufacturer === ''
            ? -1
            : Number.parseInt(request.body.locationIsManufacturer, 10),
        locationIsActive: request.body.locationIsActive
    });
    response.json(locations);
}
