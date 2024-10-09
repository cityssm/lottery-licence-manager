import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Licences - Update', () => {
    before(() => {
        logout();
        login(testUpdate);
    });
    after(logout);
    it('Has a "Create" link on the dashboard', () => {
        cy.visit('/dashboard');
        cy.get("a[href$='/licences/new']").should('exist');
    });
    it('Has a "Create" link on the Licence Search', () => {
        cy.visit('/licences');
        cy.get("a[href$='/licences/new']").should('exist');
    });
});
