describe('Serenity.is Login Page', () => {
    it('should load the login page', () => {
      cy.visit('/Account/Login')
      cy.get('#LoginPanel').should('be.visible')
    })
  })