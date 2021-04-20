import { tryResetPassword } from "../../helpers/usersDB/tryResetPassword.js";
export const handler = async (req, res) => {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = await tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
};
export default handler;
