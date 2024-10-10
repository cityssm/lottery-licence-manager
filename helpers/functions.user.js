export function userIsAdmin(request) {
    return request.session?.user.userProperties.isAdmin ?? false;
}
export function userCanUpdate(request) {
    return request.session?.user.userProperties.canUpdate ?? false;
}
export function userCanCreate(request) {
    return request.session?.user.userProperties.canCreate ?? false;
}
export function getHashString(userName, passwordPlain) {
    return `${userName}::${passwordPlain}`;
}
