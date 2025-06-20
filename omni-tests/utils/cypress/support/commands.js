// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//

Cypress.Commands.add('textField', () => cy.get('.ui-input > input'));
Cypress.Commands.add('button', text => cy.get('.ui-button').contains(text));

Object.defineProperty(cy, 'loginRequest', {
    get() {
        const intercept = response => {
            cy.intercept(
                'POST',
                'https://dev-int0-uc-sso-api.uis.st/api-login',
                response,
            ).as('loginRequest');
        };

        const interceptFor = {};

        Object.defineProperty(interceptFor, 'spying', {
            get() {
                intercept(value => {});

                return {
                    shouldBeSent() {
                        cy.get('@loginRequest')
                            .its('request.body')
                            .should(body => {
                                expect(body).to.have.property('username', 'botusharova');
                                expect(body).to.have.property('password', '8Gls8h31agwLf5k');
                            });
                    },
                };
            },

            set() {},
        });

        Object.defineProperty(interceptFor, 'stubbing', {
            get() {
                return {
                    receiveResponse() {
                        intercept({
                            statusCode: 200,
                            body: '{}',
                        });
                    },
                };
            },

            set() {},
        });

        return { interceptFor };
    },

    set() {},
});

chai.Assertion.overwriteProperty('disabled', function (original) {
    return function () {
        const button = this._obj?.[0]?.closest('.ui-button');

        if (!button) {
            return original.apply(this);
        }

        this.assert(
            button.hasAttribute('disabled'),
            'expected button to be disabled',
            'expected button not to be disabled',
        );
    };
});

Cypress.Commands.add('unauthorized', text => {
    cy.intercept('https://app2.comagic.ru/ss/settings/**', {
        statusCode: 404,
        body: '404 Not Found',
    });

    cy.intercept('https://**.mindbox.ru/**', {
        statusCode: 404,
        body: '404 Not Found',
    });

    cy.intercept('https://dev-int0-uc-sso-api.uis.st/sso/check', {
        statusCode: 401,
        body: '401 Unauthorized',
    });
});

Cypress.Commands.add('withLabel', { prevSubject: 'element' }, (subject, label) => {
    const filter = input => input.
        closest('.ui-label')?.
        querySelector('.ui-label-content')?.
        textContent?.
        includes(label);

    return cy.wrap(subject)
        .should(inputs => {
            expect([...inputs]
                .find(filter))
                .to
                .exist;
        })
        .then(inputs => inputs.filter((index, input) => filter(input)));
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })