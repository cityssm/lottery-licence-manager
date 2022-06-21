import { testView } from "../../../test/_globals.js";
import { logout, login, ajaxDelayMillis } from "../../support/index.js";
describe("Recent Events", function () {
    before(function () {
        logout();
        login(testView);
        cy.visit("/events/recent");
    });
    after(logout);
    it("Has no detectable accessibility issues", function () {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
