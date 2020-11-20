"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenJSON = exports.getHashString = exports.userCanCreate = exports.userCanUpdate = exports.userIsAdmin = void 0;
const userIsAdmin = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
exports.userIsAdmin = userIsAdmin;
const userCanUpdate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
exports.userCanUpdate = userCanUpdate;
const userCanCreate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
exports.userCanCreate = userCanCreate;
const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
exports.getHashString = getHashString;
const forbiddenJSON = (res) => {
    return res
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
exports.forbiddenJSON = forbiddenJSON;
