/// <reference types="cypress" />

Cypress.Commands.add('login', (username?: string, password?: string) => {
    const doLogin = (user: string, pass: string) => {
        cy.visit('/Account/Login')
        cy.get('#LoginPanel0_Username').should('be.enabled').clear().type(user)
        cy.get('#LoginPanel0_Password').should('be.enabled').clear().type(pass)
        cy.get('#LoginPanel0_LoginButton').click()
        cy.url().should('not.include', '/Account/Login')
    }

    if (username && password) {
        doLogin(username, password)
    } else {
        cy.fixture('users').then((users) => {
            doLogin(users.validUser.username, users.validUser.password)
        })
    }
})