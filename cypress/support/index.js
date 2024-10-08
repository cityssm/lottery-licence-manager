import 'cypress-axe';
export function logout() {
    cy.visit('/logout');
}
export function login(userName) {
    cy.visit('/login');
    cy.get('.message').contains('Testing', { matchCase: false });
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get('form').submit();
    cy.location('pathname').should('not.contain', '/login');
    cy.get('.navbar').should('have.length', 1);
}
export const ajaxDelayMillis = 800;
