import { forbiddenJSON } from "../../handlers/permissions.js";
import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";
export const handler = (req, res) => {
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return forbiddenJSON(res);
    }
    const success = inactivateUser(userNameToDelete);
    res.json({
        success
    });
};
