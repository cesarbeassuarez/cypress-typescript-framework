import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// API pública pensada para practicar automation:
//   https://restful-booker.herokuapp.com/apidoc/
// La URL viene de cypress.config.ts → env.apiUrl (no la hardcodeo acá).

describe('API testing con cy.request — Restful-Booker', () => {
    const apiUrl = Cypress.env('apiUrl') as string

    // ─────────────────────────────────────────────────────────
    // 1. GET — leer datos
    // ─────────────────────────────────────────────────────────
    context('1. GET — leer datos', () => {
        it('GET /booking devuelve un array de bookingid', () => {
            cy.request('GET', `${apiUrl}/booking`).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.headers['content-type']).to.include('application/json')
                expect(response.body).to.be.an('array')
                expect(response.body.length).to.be.greaterThan(0)
                expect(response.body[0]).to.have.property('bookingid')
            })
        })

        it('GET /booking/:id devuelve un booking específico (chaining)', () => {
            // Primero traigo la lista, agarro el primer id y con eso pido el detalle.
            // Es el patrón real: no hardcodear ids en tests.
            cy.request('GET', `${apiUrl}/booking`).then((list) => {
                const firstId = list.body[0].bookingid

                cy.request('GET', `${apiUrl}/booking/${firstId}`).then((detail) => {
                    expect(detail.status).to.eq(200)
                    expect(detail.body).to.have.all.keys(
                        'firstname',
                        'lastname',
                        'totalprice',
                        'depositpaid',
                        'bookingdates',
                        'additionalneeds'
                    )
                })
            })
        })

        it('GET con query params filtra por firstname', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/booking`,
                qs: { firstname: 'Sally' }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.be.an('array')
                // No aseguro length > 0: puede no existir ninguna "Sally" en el server.
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 2. Auth — obtener token
    // ─────────────────────────────────────────────────────────
    context('2. Auth — POST /auth', () => {
        it('credenciales válidas devuelven token', () => {
            cy.request('POST', `${apiUrl}/auth`, {
                username: 'admin',
                password: 'password123'
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('token')
                expect(response.body.token).to.be.a('string').and.have.length.above(10)
            })
        })

        it('credenciales inválidas devuelven 200 + reason (trampa)', () => {
            // Trampa real de Restful-Booker: NO devuelve 401.
            // Responde 200 con { reason: 'Bad credentials' }.
            // Este tipo de detalles solo los ves probando la API.
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth`,
                body: { username: 'admin', password: 'wrong' },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('reason', 'Bad credentials')
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 3. POST — crear booking
    // ─────────────────────────────────────────────────────────
    context('3. POST — crear booking', () => {
        it('POST /booking crea la reserva y devuelve bookingid', () => {
            cy.fixture('booking').then((payload) => {
                cy.request('POST', `${apiUrl}/booking`, payload).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('bookingid').that.is.a('number')
                    expect(response.body.booking).to.deep.include({
                        firstname: payload.firstname,
                        lastname: payload.lastname,
                        totalprice: payload.totalprice
                    })
                })
            })
        })

        it('POST con Content-Type raro falla', () => {
            // Fuerzo un Content-Type incorrecto para ver cómo reacciona la API.
            cy.request({
                method: 'POST',
                url: `${apiUrl}/booking`,
                body: '{}',
                headers: { 'Content-Type': 'text/plain' },
                failOnStatusCode: false
            }).then((response) => {
                // No aseguro un status exacto porque distintos servers responden distinto:
                // Restful-Booker suele tirar 500 acá. Lo que quiero es que NO sea 200.
                expect(response.status).to.not.eq(200)
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 4. PUT / PATCH / DELETE — necesitan token
    // ─────────────────────────────────────────────────────────
    context('4. PUT / PATCH / DELETE — requieren auth', () => {
        let bookingId: number
        let token: string

        beforeEach(() => {
            // Cada test parte de un booking limpio y un token fresco.
            // Usar `before` acumularía estado entre tests si uno falla.
            cy.request('POST', `${apiUrl}/auth`, {
                username: 'admin',
                password: 'password123'
            }).its('body.token').then((t: string) => {
                token = t
            })

            cy.fixture('booking').then((payload) => {
                cy.request('POST', `${apiUrl}/booking`, payload)
                    .its('body.bookingid')
                    .then((id: number) => {
                        bookingId = id
                    })
            })
        })

        it('PUT /booking/:id actualiza toda la reserva', () => {
            cy.fixture('booking').then((payload) => {
                const updated = { ...payload, firstname: 'Actualizado', totalprice: 999 }

                cy.request({
                    method: 'PUT',
                    url: `${apiUrl}/booking/${bookingId}`,
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Cookie: `token=${token}`
                    },
                    body: updated
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.firstname).to.eq('Actualizado')
                    expect(response.body.totalprice).to.eq(999)
                })
            })
        })

        it('PATCH /booking/:id actualiza solo campos parciales', () => {
            cy.request({
                method: 'PATCH',
                url: `${apiUrl}/booking/${bookingId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Cookie: `token=${token}`
                },
                body: { firstname: 'ParcheOK' }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.firstname).to.eq('ParcheOK')
            })
        })

        it('DELETE /booking/:id borra la reserva (devuelve 201, no 204 — trampa)', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/booking/${bookingId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `token=${token}`
                }
            }).its('status').should('eq', 201)

            // Verifico que ya no existe: 404
            cy.request({
                method: 'GET',
                url: `${apiUrl}/booking/${bookingId}`,
                failOnStatusCode: false
            }).its('status').should('eq', 404)
        })

        it('DELETE sin token → 403', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/booking/${bookingId}`,
                failOnStatusCode: false
            }).its('status').should('eq', 403)
        })
    })

    // ─────────────────────────────────────────────────────────
    // 5. Chaining con custom commands
    // ─────────────────────────────────────────────────────────
    context('5. Chaining — POST → GET → DELETE con custom commands', () => {
        it('crea, lee y borra una reserva en un solo flujo', () => {
            // apiLogin y authRequest están en support/commands.ts.
            // El objetivo es que el test lea a nivel intención, no de plumbing.
            cy.apiLogin().then((token) => {
                cy.fixture('booking').then((payload) => {
                    cy.request('POST', `${apiUrl}/booking`, payload)
                        .its('body.bookingid')
                        .then((id: number) => {
                            cy.request('GET', `${apiUrl}/booking/${id}`)
                                .its('body.firstname')
                                .should('eq', payload.firstname)

                            cy.authRequest('DELETE', `/booking/${id}`, token)
                                .its('status')
                                .should('eq', 201)
                        })
                })
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 6. Data-driven — múltiples bookings desde fixture
    // ─────────────────────────────────────────────────────────
    context('6. Data-driven — bookings-bulk.json', () => {
        it('crea 3 reservas iterando el fixture', () => {
            cy.fixture('bookings-bulk').then((bookings: Array<Record<string, unknown>>) => {
                bookings.forEach((booking) => {
                    cy.request('POST', `${apiUrl}/booking`, booking).then((response) => {
                        expect(response.status).to.eq(200)
                        expect(response.body.booking).to.deep.include({
                            firstname: booking.firstname,
                            lastname: booking.lastname
                        })
                    })
                })
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 7. Errores — 404, 400, 500
    // ─────────────────────────────────────────────────────────
    context('7. Errores — failOnStatusCode: false', () => {
        it('GET a un id inexistente → 404', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/booking/999999999`,
                failOnStatusCode: false
            }).its('status').should('eq', 404)
        })

        it('POST con body incompleto no crea la reserva', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/booking`,
                body: { firstname: 'Solo' }, // faltan campos obligatorios
                failOnStatusCode: false
            }).then((response) => {
                // Restful-Booker tira 500 acá. Asserteo que NO es 200.
                expect(response.status).to.not.eq(200)
            })
        })
    })

    // ─────────────────────────────────────────────────────────
    // 8. Schema validation con AJV
    // ─────────────────────────────────────────────────────────
    context('8. Schema validation (AJV + JSON Schema)', () => {
        it('la respuesta de GET /booking/:id cumple el schema', () => {
            cy.fixture('schemas/booking-schema').then((schema) => {
                const ajv = new Ajv({ allErrors: true })
                addFormats(ajv)
                const validate = ajv.compile(schema)

                cy.request('GET', `${apiUrl}/booking`).then((list) => {
                    const id = list.body[0].bookingid
                    cy.request('GET', `${apiUrl}/booking/${id}`).then((response) => {
                        const ok = validate(response.body)
                        if (!ok) {
                            // Log al runner para debug rápido
                            // eslint-disable-next-line no-console
                            console.log('AJV errors:', validate.errors)
                        }
                        expect(ok, JSON.stringify(validate.errors)).to.eq(true)
                    })
                })
            })
        })
    })
})
