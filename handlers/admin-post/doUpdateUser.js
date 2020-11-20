"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateUser_1 = require("../../helpers/usersDB/updateUser");
const handler = (req, res) => {
    const changeCount = updateUser_1.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
exports.handler = handler;
