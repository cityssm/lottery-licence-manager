"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const tryResetPassword_1 = require("../../helpers/usersDB/tryResetPassword");
const handler = async (req, res) => {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = await tryResetPassword_1.tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
};
exports.handler = handler;
