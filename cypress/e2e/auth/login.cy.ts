import { LoginPage } from '../../pages/LoginPage'
import users from '../../fixtures/users.json'

describe('Serenity.is Login Page', () => {
    const loginPage = new LoginPage()

    // ===== LOGIN POSITIVO =====
    context('login positivo', () => {

        it('should load the login page', () => {
            loginPage.visit()
            cy.get('#LoginPanel').should('be.visible')
        })

        it('should login with valid credentials', () => {
            loginPage.visit()
            loginPage.login(users.validUser.username, users.validUser.password)
            cy.url().should('not.include', '/Account/Login')
        })

        it('should login with pre-loaded credentials', () => {
            loginPage.visit()
            loginPage.clickLogin()
            cy.url().should('not.include', '/Account/Login')
        })

    })

    // ===== LOGIN NEGATIVO — DATA-DRIVEN =====
    context('login negativo — data-driven', () => {

        users.invalidCredentials.forEach((datos) => {
            it(`login inválido: ${datos.caso}`, () => {
                loginPage.visit()
                loginPage.login(datos.username, datos.password)
                loginPage.getErrorMessage().should('contain', datos.expectedError)
            })
        })

    })

    // ===== EMPTY FIELDS (caso especial) =====
    context('empty fields', () => {

        it('should show error with empty fields', () => {
            loginPage.visit()
            cy.get('#LoginPanel0_Username').invoke('removeAttr', 'required')
            cy.get('#LoginPanel0_Password').invoke('removeAttr', 'required')
            cy.get('#LoginPanel0_Username').invoke('val', '').trigger('input').trigger('change')
            cy.get('#LoginPanel0_Password').invoke('val', '').trigger('input').trigger('change')
            loginPage.clickLogin()
            loginPage.getErrorMessage().should('be.visible')
        })

    })

    // ===== CYPRESS FEATURES (didácticos) =====
    context('cypress features', () => {

        it('should find the login button by text', () => {
            loginPage.visit()
            cy.contains('Sign In').should('be.visible')
            cy.contains('Forgot password?').should('be.visible')
            cy.contains('Google').should('be.visible')
        })

        it('should find elements within the login form', () => {
            loginPage.visit()
            cy.get('#LoginPanel').within(() => {
                cy.get('input[name="Username"]').should('exist')
                cy.get('input[name="Password"]').should('exist')
                cy.get('button[type="submit"]').should('be.visible')
            })
            cy.get('#LoginPanel').find('button[type="submit"]').should('contain', 'Sign In')
        })

    })

})