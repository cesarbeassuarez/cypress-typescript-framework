import { ClientesPage } from '../../pages/ClientesPage'
import { DashboardPage } from '../../pages/DashboardPage'

describe('Módulo Clientes — interacciones con la grilla', () => {
    const clientesPage = new ClientesPage()
    const dashboardPage = new DashboardPage()

    beforeEach(() => {
        cy.login()
        dashboardPage.irAClientes()
    })

    context('ordenamiento', () => {

        it('ordenar por ID: primer click asc (ALFKI), segundo click desc (WOLZA)', () => {
            clientesPage.getPrimerIDVisible().should('have.text', 'ALFKI')
            clientesPage.ordenarPorID()
            clientesPage.getPrimerIDVisible().should('have.text', 'ALFKI')
            clientesPage.ordenarPorID()
            clientesPage.getPrimerIDVisible().should('have.text', 'WOLZA')
        })

        it('ordenar por Empresa: asc (Alfreds Futterkiste), desc (Wolski Zajazd)', () => {
            clientesPage.ordenarPorEmpresa()
            clientesPage.getPrimerValorColumna(1).should('have.text', 'Alfreds Futterkiste')
            clientesPage.ordenarPorEmpresa()
            clientesPage.getPrimerValorColumna(1)
                .invoke('text')
                .should('match', /Wolski\s+Zajazd/)
        })

    })

    context('filtros Select2', () => {

        it('filtrar por Argentina: 3 clientes (CACTU, OCEAN, RANCH)', () => {
            clientesPage.filtrarPorPais('Argentina')
            clientesPage.getContadorRegistros().should('contain', '3')
            clientesPage.getPrimerIDVisible().should('exist')
            cy.get('div.slick-row').should('have.length', 3)
        })

        it('filtro combinado: Argentina + Buenos Aires = 3', () => {
            clientesPage.filtrarPorPais('Argentina')
            clientesPage.filtrarPorCiudad('Buenos Aires')
            clientesPage.getContadorRegistros().should('contain', '3')
        })

        it('limpiar filtro País vuelve a 91', () => {
            clientesPage.filtrarPorPais('Argentina')
            clientesPage.getContadorRegistros().should('contain', '3')
            clientesPage.limpiarFiltroPais()
            clientesPage.getContadorRegistros().should('contain', '91')
        })

    })

    context('búsqueda', () => {

        it('buscar ALFKI devuelve 1 resultado', () => {
            clientesPage.buscar('ALFKI')
            clientesPage.getContadorRegistros().should('contain', '1')
            clientesPage.getPrimerIDVisible().should('have.text', 'ALFKI')
        })

        it('buscar texto inexistente devuelve 0 resultados', () => {
            clientesPage.buscar('ZZZZZ_NO_EXISTE')
            clientesPage.getContadorRegistros().should('contain', 'No hay registros')
        })

    })

})