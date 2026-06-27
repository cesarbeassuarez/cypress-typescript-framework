import { ClientesPage } from '../../pages/ClientesPage'
import { DashboardPage } from '../../pages/DashboardPage'

describe('Validación de datos contra Excel', () => {
    const clientesPage = new ClientesPage()
    const dashboardPage = new DashboardPage()

    const rutaExcel = 'cypress/test-data/clientes-data.xlsx'
    
    // ===== OPCIÓN A: SlickGrid API =====
    context('SlickGrid API — datos en memoria de la grilla', () => {
        beforeEach(() => {
            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()
        })

        it('los 91 clientes coinciden con el Excel', () => {
            cy.task('leerClientesDesdeExcel', rutaExcel).then((excelData: any) => {
                const idsExcel = Object.keys(excelData)
        
                clientesPage.leerDatosDesdeSlickGrid().then((grillaData) => {
                    const idsGrilla = Object.keys(grillaData)
                    const errores: string[] = []
        
                    if (idsGrilla.length !== idsExcel.length) {
                        errores.push(`Cantidad: grilla=${idsGrilla.length}, excel=${idsExcel.length}`)
                    }
        
                    for (const id of idsExcel) {
                        const esperado = excelData[id]
                        const real = grillaData[id]
        
                        if (!real) {
                            errores.push(`${id} no existe en la grilla`)
                            continue
                        }
        
                        const campos = [
                            ['empresa', esperado.empresa, real.empresa],
                            ['contacto', esperado.contacto, real.contacto],
                            ['titulo', esperado.titulo, real.titulo],
                            ['region', esperado.region, real.region],
                            ['codigoPostal', esperado.codigoPostal, real.codigoPostal],
                            ['pais', esperado.pais, real.pais],
                            ['ciudad', esperado.ciudad, real.ciudad],
                            ['telefono', esperado.telefono, real.telefono],
                            ['fax', esperado.fax, real.fax],
                        ]
        
                        for (const [campo, valorExcel, valorGrilla] of campos) {
                            if (valorExcel !== valorGrilla) {
                                errores.push(`${id} - ${campo}: excel="${valorExcel}" | grilla="${valorGrilla}"`)
                            }
                        }
                    }
        
                    // Chequeamos IDs que están en grilla pero no en Excel
                    for (const id of idsGrilla) {
                        if (!excelData[id]) {
                            errores.push(`${id} está en la grilla pero no en el Excel`)
                        }
                    }
        
                    if (errores.length > 0) {
                        throw new Error(
                            `${errores.length} diferencias encontradas:\n\n${errores.join('\n')}`
                        )
                    }
                })
            })
        })
        
    })

    // ===== OPCIÓN B: cy.intercept — datos del servidor =====
    context('cy.intercept — respuesta del servidor', () => {
        it('la respuesta del API coincide con el Excel', () => {
            cy.intercept('POST', '**/Services/Northwind/Customer/List').as('customerList')
        
            cy.login()
            dashboardPage.irAClientes()
            clientesPage.verificarVisible()
        
            cy.wait('@customerList').then((interception) => {
                const entities = interception.response?.body?.Entities
                    || interception.response?.body?.entities
                    || []
        
                cy.task('leerClientesDesdeExcel', rutaExcel).then((excelData: any) => {
                    const errores: string[] = []
        
                    if (entities.length !== Object.keys(excelData).length) {
                        errores.push(`Cantidad: API=${entities.length}, excel=${Object.keys(excelData).length}`)
                    }
        
                    for (const entity of entities) {
                        const id = entity.CustomerID || entity.customerId
                        const esperado = excelData[id]
        
                        if (!esperado) {
                            errores.push(`${id} está en el API pero no en el Excel`)
                            continue
                        }
        
                        const campos = [
                            ['empresa', esperado.empresa, entity.CompanyName || ''],
                            ['contacto', esperado.contacto, entity.ContactName || ''],
                            ['titulo', esperado.titulo, entity.ContactTitle || ''],
                            ['region', esperado.region, entity.Region || ''],
                            ['codigoPostal', esperado.codigoPostal, entity.PostalCode || ''],
                            ['pais', esperado.pais, entity.Country || ''],
                            ['ciudad', esperado.ciudad, entity.City || ''],
                            ['telefono', esperado.telefono, entity.Phone || ''],
                            ['fax', esperado.fax, entity.Fax || ''],
                        ]
        
                        for (const [campo, valorExcel, valorApi] of campos) {
                            if (valorExcel !== valorApi) {
                                errores.push(`${id} - ${campo}: excel="${valorExcel}" | api="${valorApi}"`)
                            }
                        }
                    }
        
                    if (errores.length > 0) {
                        throw new Error(
                            `${errores.length} diferencias encontradas:\n\n${errores.join('\n')}`
                        )
                    }
                })
            })
        })
    })
})