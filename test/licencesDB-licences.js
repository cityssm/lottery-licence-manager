"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const getLicence_1 = require("../helpers/licencesDB/getLicence");
const getLicences_1 = require("../helpers/licencesDB/getLicences");
const getDistinctTermsConditions_1 = require("../helpers/licencesDB/getDistinctTermsConditions");
const getLicenceActivityByDateRange_1 = require("../helpers/licencesDB/getLicenceActivityByDateRange");
const getNextExternalLicenceNumberFromRange_1 = require("../helpers/licencesDB/getNextExternalLicenceNumberFromRange");
describe("licencesDB/licences", () => {
    it("should execute getLicence()", () => {
        assert.equal(getLicence_1.getLicence(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLicences()", () => {
        assert.equal(typeof getLicences_1.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
    });
    it("should execute getDistinctTermsConditions()", () => {
        assert.equal(typeof getDistinctTermsConditions_1.getDistinctTermsConditions(-1), "object");
    });
    it("should execute getLicenceActivityByDateRange()", () => {
        assert.equal(getLicenceActivityByDateRange_1.getLicenceActivityByDateRange(20200101, 20201231).startDateString, "2020-01-01");
    });
    it("should execute getNextExternalLicenceNumberFromRange()", () => {
        assert.equal(typeof getNextExternalLicenceNumberFromRange_1.getNextExternalLicenceNumberFromRange(), "number");
    });
});
