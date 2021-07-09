export const userIsAdmin = (request) => {
    var _a;
    const user = (_a = request.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
export const userCanUpdate = (request) => {
    var _a;
    const user = (_a = request.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
export const userCanCreate = (request) => {
    var _a;
    const user = (_a = request.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
export const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
