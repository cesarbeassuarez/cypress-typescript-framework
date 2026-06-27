export class ClientesPage {
    // Selectores base
    private heading = '#GridDiv'
    private searchBox = 'input.s-QuickSearchInput'
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
    ordenarPorID() {
        cy.get(this.headerID).click()
    }
    
    ordenarPorEmpresa() {
        cy.get(this.headerEmpresa).click()
    }
    
    getPrimerIDVisible() {
        return cy.get(this.grillaFilas).first().find('div.slick-cell.l0')
    }
    
    getPrimerValorColumna(colIndex: number) {
        return cy.get(this.grillaFilas).first().find(`div.slick-cell.l${colIndex}`)
    }

    filtrarPorPais(pais: string) {
        cy.get(this.filtroPais).find('.select2-choice').click()
        cy.get('.select2-results').contains(pais).click()
    }
    
    filtrarPorCiudad(ciudad: string) {
        cy.get(this.filtroCiudad).find('.select2-choice').click()
        cy.get('.select2-results').contains(ciudad).click()
    }
    
    limpiarFiltroPais() {
        cy.get(this.filtroPais).find('abbr.select2-search-choice-close').click()
    }

    buscar(texto: string) {
        cy.get(this.searchBox).clear().type(texto, { delay: 50 })
    }
    
    limpiarBusqueda() {
        cy.get(this.searchBox).clear()
    }
}