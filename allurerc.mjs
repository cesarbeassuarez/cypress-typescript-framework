import { defineConfig } from 'allure'

// Config de Allure 3. La CLI la detecta sola al correr `allure generate`.
export default defineConfig({
  name: 'Cypress + TypeScript — Reporte de ejecución',
  output: './allure-report',

  // History para el Trend: Allure 3 lo guarda en un único .jsonl y lo va
  // appendeando entre corridas (reemplaza el copiado manual de la carpeta
  // history que necesitaba Allure 2). Con 2+ corridas aparece la tendencia.
  historyPath: './allure-history.jsonl',
  appendHistory: true,

  plugins: {
    awesome: {
      options: {
        // Un único HTML autocontenido: se abre con doble clic, sin servidor.
        // Es el reporte que uso para presentar (como en el trabajo).
        singleFile: true,
        reportLanguage: 'en',
      },
    },
  },
})
