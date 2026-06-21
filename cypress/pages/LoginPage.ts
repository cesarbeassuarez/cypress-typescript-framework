export class LoginPage {
    private usernameInput = '#LoginPanel0_Username'
    private passwordInput = '#LoginPanel0_Password'
    private loginButton = '#LoginPanel0_LoginButton'
    private errorBanner = '.toast-message'

    visit() {
        cy.visit('/Account/Login')
    }

    login(username: string, password: string) {
        cy.get(this.usernameInput).should('be.enabled').clear().type(username)
        cy.get(this.passwordInput).should('be.enabled').clear().type(password)
        cy.get(this.loginButton).click()
    }

    clickLogin() {
        cy.get(this.loginButton).click()
    }

    getErrorMessage() {
        return cy.get(this.errorBanner)
    }
}