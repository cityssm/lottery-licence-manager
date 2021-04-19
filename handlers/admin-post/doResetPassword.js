import { generateNewPassword } from "../../helpers/usersDB/generateNewPassword.js";
export const handler = async (req, res) => {
    const newPassword = await generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword
    });
};
