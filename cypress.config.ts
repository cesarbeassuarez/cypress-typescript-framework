import { defineConfig } from 'cypress'
import ExcelJS from 'exceljs'
// @ts-ignore - cypress-on-fix no trae tipos propios
import cypressOnFix from 'cypress-on-fix'
import mochawesome from 'cypress-mochawesome-reporter/plugin'
import { allureCypress } from 'allure-cypress/reporter'

export default defineConfig({
  // ─────────────────────────────────────────────────────────
  // Reporter: Mochawesome (HTML autocontenido, con charts y
  // screenshots embebidos). Es un reporter de Mocha → se setea
  // acá, en la raíz, no en setupNodeEvents.
  // ─────────────────────────────────────────────────────────
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    reportPageTitle: 'Cypress + TypeScript — Reporte de ejecución',
    charts: true,
    // Meto las capturas dentro del HTML (base64) y genero un
    // único index.html que puedo abrir/compartir sin carpeta de assets.
    embeddedScreenshots: true,
    inlineAssets: true,
    // Con retries: 2 cada fallo genera 3 capturas. Guardo solo la última
    // para que el reporte no se llene de intentos repetidos.
    saveAllAttempts: false,
    quiet: true,
  },
  // Limpio reportes/capturas desde scripts/report.js, así que apago el
  // "trash" de Cypress: en Windows a veces falla al vaciar
  // cypress/screenshots si un archivo está abierto → warning ruidoso.
  trashAssetsBeforeRuns: false,
  // ─────────────────────────────────────────────────────────
  // Config PÚBLICA (no sensible): se expone al browser a propósito.
  // URLs, feature flags, versiones de API... se leen con Cypress.expose().
  // ─────────────────────────────────────────────────────────
  expose: {
    // API pública que uso en el módulo de API testing.
    // Restful-Booker: https://restful-booker.herokuapp.com/apidoc/
    apiUrl: 'https://restful-booker.herokuapp.com'
  },
  // Corta el uso del viejo Cypress.env() (deprecado por inseguro desde 15.10).
  // Obliga a usar cy.env() para secretos y Cypress.expose() para config pública.
  allowCypressEnv: false,
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
      // ─────────────────────────────────────────────────────
      // Cypress permite UN SOLO handler por evento (after:run,
      // after:spec, before:run...). Mochawesome y Allure quieren
      // los mismos → el segundo pisa al primero. cypress-on-fix
      // envuelve `on` para permitir varios handlers por evento.
      // ─────────────────────────────────────────────────────
      on = cypressOnFix(on)

      // Reporter Mochawesome (engancha before:run / after:run)
      mochawesome(on)

      // Reporter Allure (engancha after:spec / after:run).
      // Ojo: hay que pasar `config` como 2º argumento.
      allureCypress(on, config, {
        resultsDir: 'allure-results',
        environmentInfo: {
          Framework: 'Cypress + TypeScript',
          Navegador: 'Edge',
          AUT: 'demo.serenity.is',
          API: 'restful-booker.herokuapp.com',
        },
      })

      // ─────────────────────────────────────────────────────
      // Task existente: leer clientes desde Excel (data-driven).
      // ─────────────────────────────────────────────────────
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

      return config
    },
  },
})
