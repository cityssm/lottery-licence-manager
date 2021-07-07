import { addOrganizationReminder } from "../../helpers/licencesDB/addOrganizationReminder.js";
export const handler = (request, response) => {
    const reminder = addOrganizationReminder(request.body, request.session);
    return reminder
        ? response.json({
            success: true,
            reminder
        })
        : response.json({
            success: false
        });
};
export default handler;
