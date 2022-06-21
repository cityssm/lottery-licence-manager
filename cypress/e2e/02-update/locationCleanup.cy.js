import { testUpdate } from "../../../test/_globals.js";
import { logout, login, ajaxDelayMillis } from "../../support/index.js";
describe("Location Cleanup", function () {
    before(function () {
        logout();
        login(testUpdate);
        cy.visit("/locations/cleanup");
    });
    after(logout);
    it("Has no detectable accessibility issues", function () {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
