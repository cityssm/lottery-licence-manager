import * as assert from "assert";
import fs from "fs";
import { version } from "../version.js";
describe("version", () => {
    it("has a version that matches the package.json", () => {
        const packageJSON = JSON.parse(fs.readFileSync("package.json", "utf-8"));
        assert.strictEqual(version, packageJSON.version);
    });
});
