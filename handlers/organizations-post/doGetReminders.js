import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    response.json(getOrganizationReminders(organizationID, request.session));
};
export default handler;
