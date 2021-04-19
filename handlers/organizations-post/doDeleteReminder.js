import { deleteOrganizationReminder } from "../../helpers/licencesDB/deleteOrganizationReminder.js";
export const handler = (req, res) => {
    const success = deleteOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
    return res.json({ success });
};
