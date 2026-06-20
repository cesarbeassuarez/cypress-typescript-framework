/// <reference types="cypress" />

Cypress.Commands.add('login', (username: string, password: string) => {
    cy.visit('/Account/Login')
    cy.get('#LoginPanel0_Username').should('be.enabled').clear().type(username)
    cy.get('#LoginPanel0_Password').should('be.enabled').clear().type(password)
    cy.get('#LoginPanel0_LoginButton').click()
    cy.url().should('not.include', '/Account/Login')
})