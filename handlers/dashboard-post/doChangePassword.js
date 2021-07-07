import { tryResetPassword } from "../../helpers/usersDB/tryResetPassword.js";
export const handler = async (request, response) => {
    const userName = request.session.user.userName;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    const result = await tryResetPassword(userName, oldPassword, newPassword);
    response.json(result);
};
export default handler;
