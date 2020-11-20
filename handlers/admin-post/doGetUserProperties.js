"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getUserProperties_1 = require("../../helpers/usersDB/getUserProperties");
const handler = (req, res) => {
    const userProperties = getUserProperties_1.getUserProperties(req.body.userName);
    res.json(userProperties);
};
exports.handler = handler;
