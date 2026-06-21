import { LoginPage } from '../../pages/LoginPage'

describe('Serenity.is Login Page', () => {
    const loginPage = new LoginPage()

    it('should load the login page', () => {
        loginPage.visit()
        cy.get('#LoginPanel').should('be.visible')
    })

    it('should login with valid credentials', () => {
        loginPage.visit()
        loginPage.login('admin', 'serenity')
        cy.url().should('not.include', '/Account/Login')
    })

    it('should login with pre-loaded credentials', () => {
        loginPage.visit()
        loginPage.clickLogin()
        cy.url().should('not.include', '/Account/Login')
    })

    it('should show error with wrong password', () => {
        loginPage.visit()
        loginPage.login('admin', 'wrongpassword')
        loginPage.getErrorMessage().should('contain', 'Nombre de usuario o contraseña inválidos')
    })

    it('should show error with wrong username', () => {
        loginPage.visit()
        loginPage.login('wronguser', 'serenity')
        loginPage.getErrorMessage().should('contain', 'Nombre de usuario o contraseña inválidos')
    })

    it('should show error with empty fields', () => {
        loginPage.visit()
        cy.get('#LoginPanel0_Username').invoke('removeAttr', 'required')
        cy.get('#LoginPanel0_Password').invoke('removeAttr', 'required')
        cy.get('#LoginPanel0_Username').invoke('val', '').trigger('input').trigger('change')
        cy.get('#LoginPanel0_Password').invoke('val', '').trigger('input').trigger('change')
        loginPage.clickLogin()
        loginPage.getErrorMessage().should('be.visible')
    })

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