"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewPassword = void 0;
const updatePassword_1 = require("./updatePassword");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const generateNewPassword = async (userName) => {
    const newPasswordPlain = stringFns.generatePassword();
    await updatePassword_1.updatePassword(userName, newPasswordPlain);
    return newPasswordPlain;
};
exports.generateNewPassword = generateNewPassword;
