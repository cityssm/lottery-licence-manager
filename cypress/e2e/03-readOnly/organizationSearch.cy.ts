import { testView } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Organization Search', () => {
  before(() => {
    logout()
    login(testView)
    cy.visit('/organizations')
  })

  after(logout)

  it('Has no detectable accessibility issues', () => {
    cy.wait(ajaxDelayMillis)
    cy.injectAxe()
    cy.checkA11y()
  })
})
