"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const http = require("http");
const app = require("../app");
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
