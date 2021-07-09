import * as assert from "assert";

import { getApplicationSetting } from "../helpers/licencesDB/getApplicationSetting.js";
import { getApplicationSettings } from "../helpers/licencesDB/getApplicationSettings.js";

import { getDashboardStats } from "../helpers/licencesDB/getDashboardStats.js";


describe("licencesDB", () => {

  it("should execute getApplicationSetting()", () => {
    assert.strictEqual(getApplicationSetting("~~FAKE SETTING~~"), "");
  });

  it("should execute getApplicationSettings()", () => {
    assert.strictEqual(typeof getApplicationSettings(), "object");
  });

  it("should execute getDashboardStats()", () => {
    assert.strictEqual(typeof getDashboardStats(), "object");
  });
});
