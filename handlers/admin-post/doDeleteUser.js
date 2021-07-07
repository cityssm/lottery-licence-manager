import { forbiddenJSON } from "../../handlers/permissions.js";
import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";
export const handler = (request, response) => {
    const userNameToDelete = request.body.userName;
    if (userNameToDelete === request.session.user.userName) {
        return forbiddenJSON(response);
    }
    const success = inactivateUser(userNameToDelete);
    response.json({
        success
    });
};
export default handler;
