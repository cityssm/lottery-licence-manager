"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const createUser_1 = require("../../helpers/usersDB/createUser");
const handler = (req, res) => {
    const newPassword = createUser_1.createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword
        });
    }
};
exports.handler = handler;
