/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────
// UI login (Serenity.is) — el que ya venía usando.
// Credenciales sensibles → cy.env() (quedan en el proceso de Node,
// nunca se serializan al browser como hacía Cypress.env()).
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
        cy.env(['user', 'password']).then(({ user, password }) => {
            cy.session('default-user', () => {
                doLogin(user as string, password as string)
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
// API auth (Restful-Booker) — POST /auth y devuelve token.
// apiUrl es config pública → Cypress.expose() (síncrono).
// Las credenciales son secretas → cy.env() (asíncrono).
// ─────────────────────────────────────────────────────────
Cypress.Commands.add('apiLogin', (username?: string, password?: string) => {
    const apiUrl = Cypress.expose('apiUrl') as string

    const resolveCreds =
        username && password
            ? cy.wrap({ user: username, pass: password }, { log: false })
            : cy.env(['apiUser', 'apiPassword']).then((e) => ({
                  user: e.apiUser as string,
                  pass: e.apiPassword as string
              }))

    return resolveCreds.then(({ user, pass }) =>
        cy.request('POST', `${apiUrl}/auth`, { username: user, password: pass })
            .its('body.token')
            .should('be.a', 'string')
    )
})

// ─────────────────────────────────────────────────────────
// Wrapper de cy.request con headers de auth ya inyectados.
// Deja al test decidir qué status esperar (failOnStatusCode: false).
// ─────────────────────────────────────────────────────────
Cypress.Commands.add(
    'authRequest',
    (method: Cypress.HttpMethod, url: string, token: string, body?: unknown) => {
        const apiUrl = Cypress.expose('apiUrl') as string
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
