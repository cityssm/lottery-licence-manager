import * as assert from "assert";

import { getApplicationSetting } from "../helpers/licencesDB/getApplicationSetting.js";
import { getApplicationSettings } from "../helpers/licencesDB/getApplicationSettings.js";

import { getDashboardStats } from "../helpers/licencesDB/getDashboardStats.js";


describe("licencesDB", () => {

  it("should execute getApplicationSetting()", () => {
    assert.equal(getApplicationSetting("~~FAKE SETTING~~"), "");
  });

  it("should execute getApplicationSettings()", () => {
    assert.equal(typeof getApplicationSettings(), "object");
  });

  it("should execute getDashboardStats()", () => {
    assert.equal(typeof getDashboardStats(), "object");
  });
});
