import { updateUser } from "../../helpers/usersDB/updateUser.js";
export const handler = (request, response) => {
    const success = updateUser(request.body);
    response.json({
        success: success
    });
};
export default handler;
