import { testView } from "../../../test/_globals.js";
import { logout, login, ajaxDelayMillis } from "../../support/index.js";
describe("Organization Reminders", () => {
    before(() => {
        logout();
        login(testView);
        cy.visit("/organizations/reminders");
    });
    after(logout);
    it("Has no detectable accessibility issues", () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
