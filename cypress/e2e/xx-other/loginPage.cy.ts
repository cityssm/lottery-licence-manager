import { logout } from '../../support/index.js'

describe('Login Page', () => {
  beforeEach(() => {
    logout()
    cy.visit('/login')
  })

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Contains a login form', () => {
    cy.get('form').should('have.length', 1)

    cy.get("form [name='_csrf']").should('exist')

    cy.get("form [name='userName']").should('exist')

    cy.get("form [name='password']")
      .should('have.length', 1)
      .invoke('attr', 'type')
      .should('equal', 'password')
  })

  it('Contains a help link', () => {
    cy.get('a').contains('help', { matchCase: false })
  })
})
