import { defineConfig } from 'cypress'

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
  },
})