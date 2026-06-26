import { ClientesPage } from '../../pages/ClientesPage'
import { DashboardPage } from '../../pages/DashboardPage'

describe('Módulo Clientes — grilla y navegación', () => {
    const clientesPage = new ClientesPage()
    const dashboardPage = new DashboardPage()

    beforeEach(() => {
        cy.login()
        dashboardPage.irAClientes()
    })

    context('navegación', () => {

        it('navega al módulo Clientes desde el dashboard', () => {
            clientesPage.verificarVisible()
            cy.url().should('include', '/Northwind/Customer')
        })

    })

    context('grilla', () => {

        it('la grilla tiene filas visibles', () => {
            clientesPage.getGrillaFilas().should('have.length.greaterThan', 0)
        })

        it('la grilla muestra las columnas esperadas', () => {
            const columnasEsperadas = ['ID', 'Nombre de la empresa', 'Nombre de contacto', 'Título de contacto', 'País', 'Ciudad']
            columnasEsperadas.forEach((columna) => {
                cy.get('.slick-header-column').contains(columna).should('exist')
            })
        })

        it('el primer cliente visible es ALFKI', () => {
            clientesPage.getGrillaFilas()
                .first()
                .find('div.slick-cell.l0')
                .should('have.text', 'ALFKI')
        })

        

    })

    context('contador de registros', () => {

        it('el contador muestra 91 registros totales', () => {
            clientesPage.getContadorRegistros()
                .should('contain', '91')
                .and('contain', 'registros totales')
        })

        it('las filas en el DOM son menos que el total real (virtual scrolling)', () => {
            clientesPage.getContadorRegistros().should('contain', '91')
            clientesPage.getGrillaFilas().should('have.length.lessThan', 91)
        })

    })

})