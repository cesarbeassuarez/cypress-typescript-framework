import { ClientesPage } from '../../pages/ClientesPage'
import { DashboardPage } from '../../pages/DashboardPage'

describe('cy.intercept — stubbing y mocking', () => {
    const clientesPage = new ClientesPage()
    const dashboardPage = new DashboardPage()

    const customerListUrl = '**/Services/Northwind/Customer/List'

    context('Stubs estáticos — respuestas fake', () => {
        it('stub con fixture — la grilla muestra solo los 3 clientes fake', () => {
            cy.intercept('POST', customerListUrl, { fixture: 'clientes-stub.json' }).as('stubCustomers')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@stubCustomers')

            cy.get('.slick-row').should('have.length', 3)
            cy.get('.slick-row').eq(0).should('contain.text', 'Empresa Stub Uno')
            cy.get('.slick-row').eq(1).should('contain.text', 'Empresa Stub Dos')
            cy.get('.slick-row').eq(2).should('contain.text', 'Empresa Stub Tres')
        })

        it('stub con respuesta vacía — la grilla no muestra registros', () => {
            cy.intercept('POST', customerListUrl, {
                body: { Entities: [], TotalCount: 0 }
            }).as('stubEmpty')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@stubEmpty')

            cy.get('.slick-row').should('have.length', 0)
        })
    })

    context('Modificación de respuesta real', () => {
        it('modifica CompanyName del primer cliente antes de que llegue a la grilla', () => {
            cy.intercept('POST', customerListUrl, (req) => {
                req.continue((res) => {
                    if (res.body?.Entities?.length > 0) {
                        res.body.Entities[0].CompanyName = 'Empresa Modificada por Cypress'
                    }
                    res.send()
                })
            }).as('modifiedResponse')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@modifiedResponse')

            cy.get('.slick-row').eq(0).should('contain.text', 'Empresa Modificada por Cypress')
        })
    })

    context('Simulación de errores y red', () => {
        it('error 500 del servidor', () => {
            cy.on('uncaught:exception', () => false)
        
            cy.intercept('POST', customerListUrl, {
                statusCode: 500,
                body: { Error: 'Internal Server Error' }
            }).as('error500')
        
            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()
        
            cy.wait('@error500')
        
            cy.get('.slick-row').should('have.length', 0)
        })

        it('respuesta lenta — delay de 3 segundos', () => {
            cy.intercept('POST', customerListUrl, (req) => {
                req.continue((res) => {
                    res.setDelay(3000)
                    res.send()
                })
            }).as('slowResponse')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@slowResponse')

            // Después del delay, la grilla debería cargar normal
            cy.get('.slick-row').should('have.length.greaterThan', 0)
        })

        it('error de red — conexión cortada', () => {
            cy.intercept('POST', customerListUrl, { forceNetworkError: true }).as('networkError')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@networkError')

            // Documentar qué pasa cuando la red se cae
            cy.get('.slick-row').should('have.length', 0)
        })
    })

    context('Validación del request', () => {
        it('verifica headers y body del POST que Serenity envía', () => {
            cy.intercept('POST', customerListUrl).as('customerRequest')

            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()

            cy.wait('@customerRequest').then((interception) => {
                // Headers
                expect(interception.request.headers).to.have.property('content-type')
                expect(interception.request.headers['content-type']).to.include('application/json')

                // Body — documentar la estructura real del request
                cy.log('Request body: ' + JSON.stringify(interception.request.body))

                // Response
                expect(interception.response?.statusCode).to.equal(200)
                expect(interception.response?.body).to.have.property('Entities')
                expect(interception.response?.body).to.have.property('TotalCount')
                expect(interception.response?.body.TotalCount).to.equal(91)
            })
        })
    })
})