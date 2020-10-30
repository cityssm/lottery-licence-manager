"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const userFns_1 = require("../../helpers/userFns");
const usersDB_inactivateUser = require("../../helpers/usersDB/inactivateUser");
exports.handler = (req, res) => {
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = usersDB_inactivateUser.inactivateUser(userNameToDelete);
    res.json({
        success
    });
};
