// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

import 'cypress-real-events'

// ─────────────────────────────────────────────────────────
// Reporters (lado browser). Cada uno necesita su registro acá:
// Mochawesome engancha los hooks para las capturas y el HTML,
// Allure engancha el ciclo de vida de cada test para sus results.
// ─────────────────────────────────────────────────────────
import 'cypress-mochawesome-reporter/register'
import 'allure-cypress'

beforeEach(() => {
    cy.intercept('**', (req) => {
        req.headers['accept-language'] = 'es-AR,es;q=0.9'
    })
})

Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Bad Request')) {
        return false
    }
})
