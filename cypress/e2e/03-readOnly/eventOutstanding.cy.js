import { testView } from "../../../test/_globals.js";
import { logout, login, ajaxDelayMillis } from "../../support/index.js";
describe("Outstanding Events", () => {
    before(() => {
        logout();
        login(testView);
        cy.visit("/events/outstanding");
    });
    after(logout);
    it("Has no detectable accessibility issues", () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
