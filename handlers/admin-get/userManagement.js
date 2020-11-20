"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getAllUsers_1 = require("../../helpers/usersDB/getAllUsers");
const handler = (_req, res) => {
    const users = getAllUsers_1.getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
exports.handler = handler;
