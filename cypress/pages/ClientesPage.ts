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

    // ===== VALIDACIÓN DE DATOS =====

    /**
     * Opción A: lee los datos directo del API interno de SlickGrid.
     * SlickGrid guarda los 91 registros en memoria — solo renderiza los visibles.
     * Con cy.window() accedemos al objeto grid y leemos .getData().getItems().
     * Sin scroll, sin DOM, sin timings.
     */
    leerDatosDesdeSlickGrid(): Cypress.Chainable<Record<string, Record<string, string>>> {
        cy.get('.s-CustomerGrid').should('be.visible')
        cy.get('div.slick-row').should('exist')
    
        return cy.window().then((win: any) => {
            const el = win.document.querySelector('.s-CustomerGrid')
            if (!el) throw new Error('Container .s-CustomerGrid no encontrado')
    
            const widget = win.Serenity.tryGetWidget(el)
            if (!widget?.slickGrid) throw new Error('SlickGrid instance no encontrada')
    
            const grid = widget.slickGrid
            const items = grid.getData().getItems()
            const clientes: Record<string, Record<string, string>> = {}
    
            for (const item of items) {
                const id = (item.CustomerID || '').trim()
                if (!id) continue
    
                clientes[id] = {
                    id,
                    empresa: (item.CompanyName || '').trim(),
                    contacto: (item.ContactName || '').trim(),
                    titulo: (item.ContactTitle || '').trim(),
                    region: (item.Region || '').trim(),
                    codigoPostal: (item.PostalCode || '').trim(),
                    pais: (item.Country || '').trim(),
                    ciudad: (item.City || '').trim(),
                    telefono: (item.Phone || '').trim(),
                    fax: (item.Fax || '').trim(),
                    representantes: Array.isArray(item.Representatives)
                    ? item.Representatives.join(', ')
                    : String(item.Representatives ?? '').trim(),
                }
            }
    
            return clientes
        })
    }
}