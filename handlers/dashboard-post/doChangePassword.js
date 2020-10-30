"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_tryResetPassword = require("../../helpers/usersDB/tryResetPassword");
exports.handler = (req, res) => {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = usersDB_tryResetPassword.tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
};
