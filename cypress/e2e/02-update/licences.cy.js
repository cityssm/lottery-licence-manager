import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Licences - Update", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    it("Has a \"Create\" link on the dashboard", function () {
        cy.visit("/dashboard");
        cy.get("a[href$='/licences/new']").should("exist");
    });
    it("Has a \"Create\" link on the Licence Search", function () {
        cy.visit("/licences");
        cy.get("a[href$='/licences/new']").should("exist");
    });
});
