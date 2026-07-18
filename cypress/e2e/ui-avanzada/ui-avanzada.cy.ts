describe('UI avanzada', () => {
    beforeEach(() => {
        cy.login()
    })

    context('file upload — imagen de producto', () => {
        it('should upload an image to a product', () => {
            cy.visit('/Northwind/Product')
            cy.get('div.slick-row').should('have.length.greaterThan', 0)
        
            cy.contains('a.s-EditLink', 'Aniseed Syrup').click()
            cy.get('.field.ProductImage').should('be.visible')
        
            // Antes del upload: botón eliminar está disabled
            cy.get('.field.ProductImage .delete-button').should('have.class', 'disabled')
        
            cy.intercept('POST', '/File/TemporaryUpload', {
                statusCode: 200,
                body: {
                    TemporaryFile: 'temporary/test-image.png',
                    Size: 2440,
                    IsImage: true,
                    Width: 85,
                    Height: 130
                }
            }).as('fileUpload')
        
            cy.get('.field.ProductImage input[type="file"]').selectFile(
                'cypress/fixtures/test-image.png',
                { force: true }
            )
        
            cy.wait('@fileUpload')
        
            // Después del upload: thumbnail aparece y botón eliminar se habilita
            cy.get('.field.ProductImage a.thumb').should('have.attr', 'title', 'test-image.png')
            cy.get('.field.ProductImage .delete-button').should('not.have.class', 'disabled')
        })
    })

    context('drag and drop — agrupación de columnas', () => {
        it('should verify initial grouping state', () => {
            cy.visit('/AdvancedSamples/DragDropGrouping')
            cy.get('div.slick-row').should('have.length.greaterThan', 0)
    
            // 2 agrupaciones pre-cargadas
            cy.get('.slick-grouping-panel .slick-dropped-grouping').should('have.length', 2)
            cy.get('.slick-grouping-panel').should('contain', 'País de envío')
            cy.get('.slick-grouping-panel').should('contain', 'Ciudad de envío')
    
            // Grupos visibles en la grilla
            cy.contains('.slick-group', 'Argentina').should('exist')
        })
    
        it('should remove a grouping by clicking the remove button', () => {
            cy.visit('/AdvancedSamples/DragDropGrouping')
            cy.get('div.slick-row').should('have.length.greaterThan', 0)
            cy.get('.slick-grouping-panel .slick-dropped-grouping').should('have.length', 2)
    
            // Remover "Ciudad de envío" clickeando la X
            cy.get('.slick-grouping-panel .slick-dropped-grouping')
                .contains('Ciudad de envío')
                .parent()
                .find('.slick-groupby-remove')
                .click()
    
            // Ahora solo 1 agrupación
            cy.get('.slick-grouping-panel .slick-dropped-grouping').should('have.length', 1)
            cy.get('.slick-grouping-panel').should('contain', 'País de envío')
            cy.get('.slick-grouping-panel').should('not.contain', 'Ciudad de envío')
        })
    })

    context('editor de texto enriquecido — notas de cliente', () => {
        beforeEach(() => {
            cy.visit('/Northwind/Customer')
            cy.get('div.slick-row').should('have.length.greaterThan', 0)
            cy.contains('a.s-EditLink', 'ANATR').click()
            cy.get('.s-CustomerDialog').should('be.visible')
            cy.contains('.nav-tabs a', 'Notas').click()
            cy.get('.s-NotesEditor .add-button').click()
            cy.get('.s-NoteDialog').should('be.visible')
        })
    
        it('should type text in the contenteditable editor', () => {
            cy.get('.s-NoteDialog .ProseMirror')
                .should('have.attr', 'contenteditable', 'true')
                .click()
                .type('Nota de prueba automatizada')
    
            cy.get('.s-NoteDialog .ProseMirror')
                .should('contain', 'Nota de prueba automatizada')
        })
    
        it('should apply bold via toolbar button', () => {
            cy.get('.s-NoteDialog .ProseMirror').click().type('texto en negrita')
            cy.get('.s-NoteDialog .ProseMirror').type('{selectall}')
    
            // Click en Bold y verificar que el botón queda activo
            cy.get('.s-NoteDialog button[title="Bold"]').click()
            cy.get('.s-NoteDialog button[title="Bold"]').should('have.class', 'active')
    
            // Verificar el HTML generado
            cy.get('.s-NoteDialog .ProseMirror strong')
                .should('contain', 'texto en negrita')
        })
    
        it('should apply italic via keyboard shortcut', () => {
            cy.get('.s-NoteDialog .ProseMirror').click().type('texto en cursiva')
            cy.get('.s-NoteDialog .ProseMirror').type('{selectall}')
    
            // Ctrl+I para cursiva
            cy.get('.s-NoteDialog .ProseMirror').type('{ctrl+i}')
    
            // Verificar el botón Italic queda activo
            cy.get('.s-NoteDialog button[title="Italic"]').should('have.class', 'active')
    
            // Verificar el HTML generado
            cy.get('.s-NoteDialog .ProseMirror em')
                .should('contain', 'texto en cursiva')
        })
    
        it('should combine multiple formats', () => {
            // Escribir texto normal primero
            cy.get('.s-NoteDialog .ProseMirror').click().type('normal ')
    
            // Activar negrita, escribir, desactivar
            cy.get('.s-NoteDialog button[title="Bold"]').click()
            cy.get('.s-NoteDialog .ProseMirror').type('negrita ')
            cy.get('.s-NoteDialog button[title="Bold"]').click()
    
            // Escribir más texto normal
            cy.get('.s-NoteDialog .ProseMirror').type('normal de nuevo')
    
            // Verificar estructura: solo "negrita" está en <strong>
            cy.get('.s-NoteDialog .ProseMirror strong')
                .should('have.length', 1)
                .and('contain', 'negrita')
    
            cy.get('.s-NoteDialog .ProseMirror')
                .should('contain', 'normal')
                .and('contain', 'normal de nuevo')
        })
    })
})