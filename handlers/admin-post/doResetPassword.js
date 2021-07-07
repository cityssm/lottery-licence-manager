import { generateNewPassword } from "../../helpers/usersDB/generateNewPassword.js";
export const handler = async (request, response) => {
    const newPassword = await generateNewPassword(request.body.userName);
    response.json({
        success: true,
        newPassword
    });
};
export default handler;
