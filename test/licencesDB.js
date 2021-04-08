"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const getApplicationSetting_1 = require("../helpers/licencesDB/getApplicationSetting");
const getApplicationSettings_1 = require("../helpers/licencesDB/getApplicationSettings");
const getDashboardStats_1 = require("../helpers/licencesDB/getDashboardStats");
describe("licencesDB", () => {
    it("should execute getApplicationSetting()", () => {
        assert.equal(getApplicationSetting_1.getApplicationSetting("~~FAKE SETTING~~"), "");
    });
    it("should execute getApplicationSettings()", () => {
        assert.equal(typeof getApplicationSettings_1.getApplicationSettings(), "object");
    });
    it("should execute getDashboardStats()", () => {
        assert.equal(typeof getDashboardStats_1.getDashboardStats(), "object");
    });
});
