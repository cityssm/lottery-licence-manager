import { getInactiveLocations } from "../../helpers/licencesDB/getInactiveLocations.js";
export const handler = (request, response) => {
    const inactiveYears = Number.parseInt(request.body.inactiveYears, 10);
    response.json(getInactiveLocations(inactiveYears));
};
export default handler;
