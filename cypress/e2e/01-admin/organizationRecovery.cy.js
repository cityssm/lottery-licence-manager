import { testAdmin } from "../../../test/_globals.js";
import { logout, login, ajaxDelayMillis } from "../../support/index.js";
describe("Organization Recovery", function () {
    before(function () {
        logout();
        login(testAdmin);
        cy.visit("/organizations/recovery");
    });
    after(logout);
    it("Has no detectable accessibility issues", function () {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
