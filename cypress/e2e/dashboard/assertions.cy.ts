describe('Serenity.is Dashboard — Assertions y Hooks', () => {

    beforeEach(() => {
      cy.login('admin', 'serenity')
    })
  
    context('page structure', () => {
  
      it('should validate the dashboard title', () => {
        cy.get('h1').should('have.text', 'Tablero')
      })
  
      it('should validate the sidebar is visible', () => {
        cy.get('#s_sidebar_menu1').should('be.visible')
      })
  
      it('should validate sidebar has menu items', () => {
        cy.get('#s_sidebar_menu1 li').should('have.length.greaterThan', 0)
      })
  
    })
  
    context('dashboard cards', () => {
  
      it('should display all four stat cards', () => {
        cy.contains('Open Orders').should('be.visible')
        cy.contains('Closed Orders').should('be.visible')
        cy.contains('Total Customers').should('be.visible')
        cy.contains('Product Types').should('be.visible')
      })
  
      it('should validate card values are numbers', () => {
        cy.contains('Open Orders').parent().find('h3').invoke('text').should('match', /\d+/)
      })
  
    })
  
    context('negative assertions', () => {
  
      it('should not show the login panel after login', () => {
        cy.get('#LoginPanel').should('not.exist')
      })
  
      it('should not display error messages on dashboard', () => {
        cy.get('.error-message').should('not.exist')
      })
  
    })

    context('explicit assertions with expect()', () => {

        it('should validate the title using expect()', () => {
          cy.get('h1').then(($h1) => {
            expect($h1.text()).to.equal('Tablero')
            expect($h1).to.be.visible
          })
        })
    
        it('should validate sidebar link attributes', () => {
          cy.get('.s-sidebar-link').first().should('have.attr', 'href')
          cy.contains('Northwind').should('be.visible')
        })
    
        it('should validate partial text with contain', () => {
          cy.get('h1').should('contain', 'Table')
          cy.get('h1').should('not.contain', 'Login')
        })
    
      })
  
  })