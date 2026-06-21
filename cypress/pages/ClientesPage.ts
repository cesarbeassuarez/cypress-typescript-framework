export class ClientesPage {
    // Selectores base
    private heading = '#GridDiv'
    private searchBox = 'input[name="SearchBox"]'
    private newClientButton = '.s-Northwind-CustomerGrid .add-button'

    // Filtros
    private filtroPais = 'div.quick-filter-item[data-qffield="Country"]'
    private filtroCiudad = 'div.quick-filter-item[data-qffield="City"]'
    private contadorRegistros = 'span.slick-pg-stat'

    // Headers de grilla
    private headerID = 'div.slick-header-column[data-id="CustomerID"]'
    private headerEmpresa = 'div.slick-header-column[data-id="CompanyName"]'

    // Grilla
    private grillaCanvas = 'div.sg-body.sg-main.grid-canvas'
    private grillaFilas = 'div.slick-row'

    verificarVisible() {
        return cy.get(this.heading).should('be.visible')
    }

    getContadorRegistros() {
        return cy.get(this.contadorRegistros)
    }

    getGrillaFilas() {
        return cy.get(this.grillaFilas)
    }
}