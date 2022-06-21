import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Update - Licences", () => {
    before(() => {
        logout();
        login(testUpdate);
    });
    it("Has a \"Create\" link on the dashboard", () => {
        cy.visit("/dashboard");
        cy.get("a[href$='/licences/new']").should("exist");
    });
    it("Has a \"Create\" link on the Licence Search", () => {
        cy.visit("/licences");
        cy.get("a[href$='/licences/new']").should("exist");
    });
});
