import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Organization Recovery', () => {
    before(() => {
        logout();
        login(testAdmin);
        cy.visit('/organizations/recovery');
    });
    after(logout);
    it('Has no detectable accessibility issues', () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
