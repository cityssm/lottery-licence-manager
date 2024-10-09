export const userIsAdmin = (request) => {
    const user = request.session?.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
export const userCanUpdate = (request) => {
    const user = request.session?.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
export const userCanCreate = (request) => {
    const user = request.session?.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
export const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
