export class DashboardPage {
    private title = 'h1'
    private sidebar = '#s_sidebar_menu1'
    private sidebarItems = '#s_sidebar_menu1 li'
    private loginPanel = '#LoginPanel'
    private errorMessage = '.error-message'

    getTitle() {
        return cy.get(this.title)
    }

    getSidebar() {
        return cy.get(this.sidebar)
    }

    getSidebarItems() {
        return cy.get(this.sidebarItems)
    }

    getLoginPanel() {
        return cy.get(this.loginPanel)
    }

    getErrorMessage() {
        return cy.get(this.errorMessage)
    }

    getStatCard(name: string) {
        return cy.contains(name)
    }

    getStatCardValue(cardName: string) {
        return cy.contains(cardName).parent().find('h3')
    }
}