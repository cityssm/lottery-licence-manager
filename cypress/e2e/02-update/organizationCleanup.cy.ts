import { testUpdate } from "../../../test/_globals.js";

import { logout, login, ajaxDelayMillis } from "../../support/index.js";

describe("Organization Cleanup", () => {
    before(() => {
        logout();
        login(testUpdate);
        cy.visit("/organizations/cleanup");
    });

    after(logout);

    it("Has no detectable accessibility issues", () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
