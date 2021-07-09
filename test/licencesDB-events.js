import * as assert from "assert";
import { fakeViewOnlySession } from "./_globals.js";
import { getEvent } from "../helpers/licencesDB/getEvent.js";
import { getEvents } from "../helpers/licencesDB/getEvents.js";
import { getEventFinancialSummary } from "../helpers/licencesDB/getEventFinancialSummary.js";
import { getOutstandingEvents } from "../helpers/licencesDB/getOutstandingEvents.js";
import { getPastEventBankingInformation } from "../helpers/licencesDB/getPastEventBankingInformation.js";
describe("licencesDB/events", () => {
    it("should execute getEvent()", () => {
        assert.strictEqual(getEvent(-1, -1, fakeViewOnlySession), undefined);
    });
    it("should execute getEvents()", () => {
        assert.strictEqual(typeof getEvents({}, fakeViewOnlySession), "object");
    });
    it("should execute getEventFinancialSummary()", () => {
        assert.strictEqual(typeof getEventFinancialSummary({
            eventDateStartString: "2021-01-01",
            eventDateEndString: "2021-12-31"
        }), "object");
    });
    it("should execute getOutstandingEvents()", () => {
        assert.strictEqual(typeof getOutstandingEvents({}, fakeViewOnlySession), "object");
    });
    it("should execute getPastEventBankingInformation()", () => {
        assert.strictEqual(typeof getPastEventBankingInformation(-1), "object");
    });
});
