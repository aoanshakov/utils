describe(
    'Открываю десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку "Войти". Отправлен запрос авторизации.',
() => {
    let loginRequest;

    beforeEach(() => {
        cy.unauthorized();

        cy.visit('https://go.localhost.uis.st:8080', {
            onBeforeLoad(win) {
                cy.websockets.reset();
                cy.websocketsFactory.enableLogging();

                win.WebSocket = cy.websocketsFactory.createConstructor();
            },
        });

        cy.textField()
            .withLabel('Логин')
            .type('botusharova');

        cy.textField()
            .withLabel('Пароль')
            .type('8Gls8h31agwLf5k');
    });

    describe('Авторизация произведена успешно. Отправлены запросы аккаунта и сататусов.', function() {
        let accountRequest,
            statusesRequest,
            tokenRequest;

        beforeEach(function() {
            tokenRequest = cy.tokenRequest.hold();
            cy.loginRequest.stub();

            cy.button('Войти').click();
        });

        it('Получены статусы и данные аккаунта.', function() {
            cy.accountRequest.stub();
            cy.statusesRequest.stub();
            cy.reportsListRequest.stub();
            cy.employeesSsoCheckRequest.stub();

            tokenRequest.expectToBeSent();

            cy.employeesWebsocket.connect().then(() => cy.clock());
            cy.employeesWebsocket.initMessage.expectToBeSent();
        });
        return;
        it('РМО недоступно.', function() {
            accountRequest = cy.accountRequest.hold();
            statusesRequest = cy.statusesRequest.hold();

            accountRequest.expectToBeSent();
            statusesRequest.expectToBeSent();

            cy.appRoot().should('have.text', '--');
        });
    });
    return;
    it('Кнопка "Войти" заблокирована.', () => {
        loginRequest = cy.loginRequest.hold();

        cy.button('Войти').click();
        loginRequest.expectToBeSent();

        cy.button('Войти').should('be.disabled');
    });
});
