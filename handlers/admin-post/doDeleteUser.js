"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const permissions_1 = require("../../handlers/permissions");
const inactivateUser_1 = require("../../helpers/usersDB/inactivateUser");
const handler = (req, res) => {
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return permissions_1.forbiddenJSON(res);
    }
    const success = inactivateUser_1.inactivateUser(userNameToDelete);
    res.json({
        success
    });
};
exports.handler = handler;
