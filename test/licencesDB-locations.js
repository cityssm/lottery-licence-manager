import * as assert from "assert";
import { fakeViewOnlySession } from "./_globals.js";
import { getLocation } from "../helpers/licencesDB/getLocation.js";
import { getLocations } from "../helpers/licencesDB/getLocations.js";
import { getInactiveLocations } from "../helpers/licencesDB/getInactiveLocations.js";
describe("licencesDB/locations", () => {
    it("should execute getLocation()", () => {
        assert.strictEqual(getLocation(-1, fakeViewOnlySession), undefined);
    });
    it("should execute getLocations()", () => {
        assert.strictEqual(typeof getLocations(fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
    });
    it("should execute getInactiveLocations()", () => {
        assert.strictEqual(typeof getInactiveLocations(5), "object");
    });
});
