import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import { getLicence } from "../helpers/licencesDB/getLicence";
import { getLicences } from "../helpers/licencesDB/getLicences";
import { getDistinctTermsConditions } from "../helpers/licencesDB/getDistinctTermsConditions";
import { getLicenceActivityByDateRange } from "../helpers/licencesDB/getLicenceActivityByDateRange";
import { getNextExternalLicenceNumberFromRange } from "../helpers/licencesDB/getNextExternalLicenceNumberFromRange";


describe("licencesDB/licences", () => {

  it("should execute getLicence()", () => {
    assert.equal(getLicence(-1, fakeViewOnlySession), null);
  });

  it("should execute getLicences()", () => {
    assert.equal(typeof getLicences({}, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
  });

  it("should execute getDistinctTermsConditions()", () => {
    assert.equal(typeof getDistinctTermsConditions(-1), "object");
  });

  it("should execute getLicenceActivityByDateRange()", () => {
    assert.equal(getLicenceActivityByDateRange(20200101, 20201231).startDateString, "2020-01-01");
  });

  it("should execute getNextExternalLicenceNumberFromRange()", () => {
    assert.equal(typeof getNextExternalLicenceNumberFromRange(), "number");
  });
});
