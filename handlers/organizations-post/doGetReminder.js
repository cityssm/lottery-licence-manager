import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const reminderIndex = req.body.reminderIndex;
    res.json(getOrganizationReminder(organizationID, reminderIndex, req.session));
};
export default handler;
