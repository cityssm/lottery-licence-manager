import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Recent Events', () => {
    before(() => {
        logout();
        login(testView);
        cy.visit('/events/recent');
    });
    after(logout);
    it('Has no detectable accessibility issues', () => {
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y();
    });
});
