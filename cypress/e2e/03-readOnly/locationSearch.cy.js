import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Location Search', () => {
    before(() => {
        logout();
        login(testView);
        cy.visit('/locations');
    });
    after(logout);
    it('Has no detectable accessibility issues', () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
