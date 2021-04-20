import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationReminders(organizationID, req.session));
};
export default handler;
