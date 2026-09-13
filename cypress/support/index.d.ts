declare namespace Cypress {
    interface Chainable {
        /**
         * Login por UI contra Serenity.is (usa cy.session).
         */
        login(username?: string, password?: string): Chainable<void>

        /**
         * Login por API contra Restful-Booker.
         * Hace POST /auth y devuelve el token como string.
         *
         * @example
         *   cy.apiLogin().then((token) => { ... })
         */
        apiLogin(username?: string, password?: string): Chainable<string>

        /**
         * cy.request con headers de auth ya inyectados (Cookie: token=...).
         * failOnStatusCode: false — el test decide qué status esperar.
         *
         * @param url  Puede ser path relativo (`/booking/1`) o URL absoluta.
         *
         * @example
         *   cy.authRequest('DELETE', `/booking/${id}`, token)
         *     .its('status').should('eq', 201)
         */
        authRequest(
            method: Cypress.HttpMethod,
            url: string,
            token: string,
            body?: unknown
        ): Chainable<Cypress.Response<any>>
    }
}
