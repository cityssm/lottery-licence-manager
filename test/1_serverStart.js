"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const http = __importStar(require("http"));
const app = __importStar(require("../app"));
const getLicences_1 = require("../helpers/licencesDB/getLicences");
const usersDB_1 = require("../helpers/usersDB");
const _globals_1 = require("./_globals");
describe("lottery-licence-manager", () => {
    const httpServer = http.createServer(app);
    const portNumber = 54333;
    let serverStarted = false;
    before(() => {
        httpServer.listen(portNumber);
        httpServer.on("listening", () => {
            serverStarted = true;
            httpServer.close();
        });
    });
    it("Ensure server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    it("Ensure licences.db exists", () => {
        assert.ok(getLicences_1.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: false, limit: 1, offset: 0 }));
    });
    it("Ensure users.db exists", () => {
        assert.ok(usersDB_1.getAllUsers());
    });
});
