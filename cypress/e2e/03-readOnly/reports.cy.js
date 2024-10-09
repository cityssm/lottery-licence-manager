import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Reports', () => {
    beforeEach(() => {
        logout();
        login(testView);
        cy.visit('/reports');
    });
    afterEach(logout);
    it('Loads page', () => {
        cy.location('pathname').should('equal', '/reports');
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Exports all reports without parameters', () => {
        cy.get("a:not(.is-hidden)[download][href*='/reports/']").each(($reportLink) => {
            cy.wrap($reportLink).click({ force: true });
            cy.wait(ajaxDelayMillis);
        });
    });
    it('Exports all reports with parameters', () => {
        cy.get("form[action*='/reports/']").each(($reportLink) => {
            cy.wrap($reportLink).invoke('attr', 'target', '_blank').submit();
            cy.wait(ajaxDelayMillis);
        });
    });
});
