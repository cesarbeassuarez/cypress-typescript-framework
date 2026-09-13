/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────
// UI login (Serenity.is) — el que ya venía usando
// ─────────────────────────────────────────────────────────
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
            cy.session('default-user', () => {
                doLogin(users.validUser.username, users.validUser.password)
            }, {
                validate() {
                    cy.getCookie('.AspNetAuth').should('exist')
                }
            })
            cy.visit('/')
        })
    }
})

// ─────────────────────────────────────────────────────────
// API auth (Restful-Booker) — POST /auth y devuelve token
// ─────────────────────────────────────────────────────────
Cypress.Commands.add('apiLogin', (username = 'admin', password = 'password123') => {
    const apiUrl = Cypress.env('apiUrl') as string

    return cy.request('POST', `${apiUrl}/auth`, { username, password })
        .its('body.token')
        .should('be.a', 'string')
})

// ─────────────────────────────────────────────────────────
// Wrapper de cy.request con headers de auth ya inyectados.
// Deja al test decidir qué status esperar (failOnStatusCode: false).
// ─────────────────────────────────────────────────────────
Cypress.Commands.add(
    'authRequest',
    (method: Cypress.HttpMethod, url: string, token: string, body?: unknown) => {
        const apiUrl = Cypress.env('apiUrl') as string
        const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`

        return cy.request({
            method,
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Cookie: `token=${token}`
            },
            body,
            failOnStatusCode: false
        })
    }
)
