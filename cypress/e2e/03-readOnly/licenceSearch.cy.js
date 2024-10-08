import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Licence Search', () => {
    before(() => {
        logout();
        login(testView);
        cy.visit('/licences');
    });
    after(logout);
    it('Has no detectable accessibility issues', () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
