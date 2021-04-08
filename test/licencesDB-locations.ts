import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import { getLocation } from "../helpers/licencesDB/getLocation";
import { getLocations } from "../helpers/licencesDB/getLocations";
import { getInactiveLocations } from "../helpers/licencesDB/getInactiveLocations";


describe("licencesDB/locations", () => {

  it("should execute getLocation()", () => {
    assert.equal(getLocation(-1, fakeViewOnlySession), null);
  });

  it("should execute getLocations()", () => {
    assert.equal(typeof getLocations(fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
  });

  it("should execute getInactiveLocations()", () => {
    assert.equal(typeof getInactiveLocations(5), "object");
  });
});
