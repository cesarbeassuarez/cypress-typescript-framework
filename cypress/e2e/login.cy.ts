describe('Serenity.is Login Page', () => {

  it('should load the login page', () => {
    cy.visit('/Account/Login')
    cy.get('#LoginPanel').should('be.visible')
  })

  it('should login with valid credentials', () => {
    cy.visit('/Account/Login')
    cy.get('#LoginPanel0_Username').clear().type('admin')
    cy.get('#LoginPanel0_Password').clear().type('serenity')
    cy.get('#LoginPanel0_LoginButton').click()
    cy.url().should('not.include', '/Account/Login')
  })

  it('should find the login button by text', () => {
    cy.visit('/Account/Login')
    cy.contains('Sign In').should('be.visible')
    cy.contains('Forgot password?').should('be.visible')
    cy.contains('Google').should('be.visible')
  })

  it('should find elements within the login form', () => {
    cy.visit('/Account/Login')
    cy.get('#LoginPanel').within(() => {
      cy.get('input[name="Username"]').should('exist')
      cy.get('input[name="Password"]').should('exist')
      cy.get('button[type="submit"]').should('be.visible')
    })
    cy.get('#LoginPanel').find('button[type="submit"]').should('contain', 'Sign In')
  })

})