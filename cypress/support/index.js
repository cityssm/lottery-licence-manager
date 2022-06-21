import "cypress-axe";
Cypress.Cookies.defaults({
    preserve: ["_csrf", "lottery-licence-manager-user-sid"]
});
export var logout = function () {
    cy.visit("/logout");
};
export var login = function (userName) {
    cy.visit("/login");
    cy.get(".message")
        .contains("Testing", { matchCase: false });
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get("form").submit();
    cy.location("pathname").should("not.contain", "/login");
    cy.get(".navbar").should("have.length", 1);
};
export var ajaxDelayMillis = 800;
