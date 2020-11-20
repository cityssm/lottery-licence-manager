"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateUserProperty_1 = require("../../helpers/usersDB/updateUserProperty");
const handler = (req, res) => {
    const changeCount = updateUserProperty_1.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
exports.handler = handler;
