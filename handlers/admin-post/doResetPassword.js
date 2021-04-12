"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const generateNewPassword_1 = require("../../helpers/usersDB/generateNewPassword");
const handler = async (req, res) => {
    const newPassword = await generateNewPassword_1.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword
    });
};
exports.handler = handler;
