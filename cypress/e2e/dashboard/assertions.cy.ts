import { DashboardPage } from '../../pages/DashboardPage'

describe('Serenity.is Dashboard — Assertions y Hooks', () => {
    const dashboardPage = new DashboardPage()

    beforeEach(() => {
        cy.login()
    })

    context('page structure', () => {

        it('should validate the dashboard title', () => {
            dashboardPage.getTitle().should('have.text', 'Tablero')
        })

        it('should validate the sidebar is visible', () => {
            dashboardPage.getSidebar().should('be.visible')
        })

        it('should validate sidebar has menu items', () => {
            dashboardPage.getSidebarItems().should('have.length.greaterThan', 0)
        })

    })

    context('dashboard cards', () => {

        it('should display all four stat cards', () => {
            dashboardPage.getStatCard('Open Orders').should('be.visible')
            dashboardPage.getStatCard('Closed Orders').should('be.visible')
            dashboardPage.getStatCard('Total Customers').should('be.visible')
            dashboardPage.getStatCard('Product Types').should('be.visible')
        })

        it('should validate card values are numbers', () => {
            dashboardPage.getStatCardValue('Open Orders').invoke('text').should('match', /\d+/)
        })

    })

    context('negative assertions', () => {

        it('should not show the login panel after login', () => {
            dashboardPage.getLoginPanel().should('not.exist')
        })

        it('should not display error messages on dashboard', () => {
            dashboardPage.getErrorMessage().should('not.exist')
        })

    })

    context('explicit assertions with expect()', () => {

        it('should validate the title using expect()', () => {
            dashboardPage.getTitle().then(($h1) => {
                expect($h1.text()).to.equal('Tablero')
                expect($h1).to.be.visible
            })
        })

        it('should validate sidebar link attributes', () => {
            cy.get('.s-sidebar-link').first().should('have.attr', 'href')
            cy.contains('Northwind').should('be.visible')
        })

        it('should validate partial text with contain', () => {
            dashboardPage.getTitle().should('contain', 'Table')
            dashboardPage.getTitle().should('not.contain', 'Login')
        })

    })

})