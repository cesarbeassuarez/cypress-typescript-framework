import { defineConfig } from 'cypress'
import ExcelJS from 'exceljs'

export default defineConfig({
  e2e: {
    baseUrl: 'https://demo.serenity.is',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on, config) {
      on('task', {
        async leerClientesDesdeExcel(rutaArchivo: string) {
          const workbook = new ExcelJS.Workbook()
          await workbook.xlsx.readFile(rutaArchivo)

          const hoja = workbook.getWorksheet('Clientes')
          if (!hoja) throw new Error(`No se encontró la hoja "Clientes" en ${rutaArchivo}`)

          const clientes: Record<string, Record<string, string>> = {}

          hoja.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return

            const id = row.getCell(1).text.trim()
            if (!id) return

            clientes[id] = {
              id,
              empresa: row.getCell(2).text.trim(),
              contacto: row.getCell(3).text.trim(),
              titulo: row.getCell(4).text.trim(),
              region: row.getCell(5).text.trim(),
              codigoPostal: row.getCell(6).text.trim(),
              pais: row.getCell(7).text.trim(),
              ciudad: row.getCell(8).text.trim(),
              telefono: row.getCell(9).text.trim(),
              fax: row.getCell(10).text.trim(),
              representantes: row.getCell(11).text.trim(),
            }
          })

          // cy.task() solo puede devolver JSON serializable — no Map.
          // Por eso devolvemos un objeto plano { ALFKI: {...}, ANATR: {...} }
          return clientes
        }
      })
    },
  },
})