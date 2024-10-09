import { testView } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Read Only User', () => {
  before(logout)

  after(logout)

  it('Logs In Successfully', () => {
    login(testView)
  })

  describe('Dashboard', () => {
    before(() => {
      cy.visit('/dashboard')
    })

    it('Has no detectable accessibility issues', () => {
      cy.injectAxe()
      cy.checkA11y()
    })

    it('Has no links to new licences', () => {
      cy.get("a[href*='/new']").should('not.exist')
    })

    it('Has no links to admin areas', () => {
      cy.get("a[href*='/admin']").should('not.exist')
    })
  })

  it('Has no link to create licences on Licence Search', () => {
    cy.visit('/licences')
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create a licence', () => {
    cy.visit('/licences/new')
    cy.location('pathname').should('equal', '/dashboard')
  })

  it('Redirects to Dashboard when attempting to alter application settings', () => {
    cy.visit('/admin/applicationSettings')
    cy.location('pathname').should('not.contain', '/admin')
  })
})
