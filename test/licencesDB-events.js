"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const getEvent_1 = require("../helpers/licencesDB/getEvent");
const getEvents_1 = require("../helpers/licencesDB/getEvents");
const getEventFinancialSummary_1 = require("../helpers/licencesDB/getEventFinancialSummary");
const getOutstandingEvents_1 = require("../helpers/licencesDB/getOutstandingEvents");
const getPastEventBankingInformation_1 = require("../helpers/licencesDB/getPastEventBankingInformation");
describe("licencesDB/events", () => {
    it("should execute getEvent()", () => {
        assert.equal(getEvent_1.getEvent(-1, -1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getEvents()", () => {
        assert.equal(typeof getEvents_1.getEvents({}, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getEventFinancialSummary()", () => {
        assert.equal(typeof getEventFinancialSummary_1.getEventFinancialSummary({
            eventDateStartString: "2021-01-01",
            eventDateEndString: "2021-12-31"
        }), "object");
    });
    it("should execute getOutstandingEvents()", () => {
        assert.equal(typeof getOutstandingEvents_1.getOutstandingEvents({}, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getPastEventBankingInformation()", () => {
        assert.equal(typeof getPastEventBankingInformation_1.getPastEventBankingInformation(-1), "object");
    });
});
