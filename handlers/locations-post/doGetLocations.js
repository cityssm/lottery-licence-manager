import { getLocations } from "../../helpers/licencesDB/getLocations.js";
export const handler = (request, response) => {
    const locations = getLocations(request.session, {
        limit: request.body.limit || -1,
        offset: request.body.offset || 0,
        locationNameAddress: request.body.locationNameAddress,
        locationIsDistributor: ("locationIsDistributor" in request.body && request.body.locationIsDistributor !== ""
            ? Number.parseInt(request.body.locationIsDistributor, 10)
            : -1),
        locationIsManufacturer: ("locationIsManufacturer" in request.body && request.body.locationIsManufacturer !== ""
            ? Number.parseInt(request.body.locationIsManufacturer, 10)
            : -1),
        locationIsActive: request.body.locationIsActive || ""
    });
    response.json(locations);
};
export default handler;
