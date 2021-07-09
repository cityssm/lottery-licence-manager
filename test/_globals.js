var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
export const fakeViewOnlySession = {
    id: "",
    cookie: undefined,
    destroy: undefined,
    regenerate: undefined,
    reload: undefined,
    resetMaxAge: undefined,
    save: undefined,
    touch: undefined,
    user: {
        userName: "test.viewOnly",
        userProperties: {
            canCreate: false,
            canUpdate: false,
            isAdmin: false,
            isDefaultAdmin: false
        }
    }
};
export const fakeAdminSession = {
    id: "",
    cookie: undefined,
    destroy: undefined,
    regenerate: undefined,
    reload: undefined,
    resetMaxAge: undefined,
    save: undefined,
    touch: undefined,
    user: {
        userName: "test.admin",
        userProperties: {
            canCreate: true,
            canUpdate: true,
            isAdmin: true,
            isDefaultAdmin: false
        }
    }
};
export const fakeRequest = {
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
        });
    },
    _destroy: undefined,
    _read: undefined,
    accepted: undefined,
    accepts: undefined,
    acceptsCharsets: undefined,
    acceptsEncodings: undefined,
    acceptsLanguages: undefined,
    addListener: undefined,
    app: undefined,
    baseUrl: undefined,
    body: undefined,
    cookies: undefined,
    complete: undefined,
    connection: undefined,
    csrfToken: undefined,
    destroy: undefined,
    destroyed: undefined,
    emit: undefined,
    eventNames: undefined,
    fresh: undefined,
    get: undefined,
    getMaxListeners: undefined,
    header: undefined,
    headers: undefined,
    host: undefined,
    hostname: undefined,
    httpVersion: undefined,
    httpVersionMajor: undefined,
    httpVersionMinor: undefined,
    ip: undefined,
    ips: undefined,
    is: undefined,
    isPaused: undefined,
    listenerCount: undefined,
    listeners: undefined,
    method: undefined,
    off: undefined,
    on: undefined,
    once: undefined,
    originalUrl: undefined,
    param: undefined,
    params: undefined,
    path: undefined,
    pause: undefined,
    pipe: undefined,
    prependListener: undefined,
    prependOnceListener: undefined,
    protocol: undefined,
    push: undefined,
    query: undefined,
    range: undefined,
    rateLimit: undefined,
    rawHeaders: undefined,
    rawListeners: undefined,
    rawTrailers: undefined,
    read: undefined,
    readable: undefined,
    readableLength: undefined,
    readableHighWaterMark: undefined,
    readableObjectMode: undefined,
    removeAllListeners: undefined,
    removeListener: undefined,
    resume: undefined,
    route: undefined,
    secure: undefined,
    session: undefined,
    sessionID: undefined,
    setEncoding: undefined,
    setMaxListeners: undefined,
    setTimeout: undefined,
    signedCookies: undefined,
    socket: undefined,
    stale: undefined,
    subdomains: undefined,
    trailers: undefined,
    unpipe: undefined,
    unshift: undefined,
    url: undefined,
    wrap: undefined,
    xhr: undefined
};
export const fakeViewOnlyRequest = Object.assign({}, fakeRequest, {
    session: fakeViewOnlySession
});
export const fakeAdminRequest = Object.assign({}, fakeRequest, {
    session: fakeAdminSession
});
export const userName = "__testUser";
