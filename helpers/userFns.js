export const userIsAdmin = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
export const userCanUpdate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
export const userCanCreate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
export const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
