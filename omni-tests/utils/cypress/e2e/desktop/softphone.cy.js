describe('Открываю десктопное приложение.', () => {
    let loginRequest;

    beforeEach(() => {
        cy.unauthorized();
    });

    describe('Ввожу логин и пароль. Нажимаю на кнопку "Войти". Отправлен запрос авторизации.', () => {
        beforeEach(() => {
            cy.visit('https://go.localhost.uis.st:8080', {
                onBeforeLoad(win) {
                    cy.init({ win });
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
            let loginRequest,
                tokenRequest,
                accountRequest,
                statusesRequest,
                reportsListRequest,
                employeesSsoCheckRequest,
                employeeSettingsRequest,
                employeeRequest;

            beforeEach(function() {
                loginRequest = cy.loginRequest.hold();
                accountRequest = cy.accountRequest.hold();
                statusesRequest = cy.statusesRequest.hold();
                reportsListRequest = cy.reportsListRequest.hold();
                tokenRequest = cy.tokenRequest.hold();
                employeesSsoCheckRequest = cy.employeesSsoCheckRequest.hold();
                employeeSettingsRequest = cy.employeeSettingsRequest.hold();
                employeeRequest = cy.employeeRequest.hold();

                cy.button('Войти').click();
                loginRequest.receiveResponse();

            });

            describe('Получены статусы и данные аккаунта.', function() {
                beforeEach(function() {
                    accountRequest.receiveResponse();
                    statusesRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                    tokenRequest.expectToBeSent();

                    employeesSsoCheckRequest.receiveResponse();
                    cy.employeesWebsocket.connect().then(() => cy.clock());

                    employeeSettingsRequest.receiveResponse();
                    employeeRequest.receiveResponse();
                });

                describe('Получена версия приложения.', function() {
                    beforeEach(function() {
                        cy.ipcRenderer.appVersion();
                    });

                    describe('Получено обновление.', function() {
                        beforeEach(function() {
                            cy.ipcRenderer.updateAvailable();
                            cy.then(() => cy.tick(2000));
                        });

                        describe('Нажимаю на кнопку "Скачать".', function() {
                            beforeEach(function() {
                                cy.button('Скачать').click();

                                cy.ipcRenderer.downloadUpdate();
                                cy.ipcRenderer.updateDownloaded();
                            });
                            
                            it('Нажимаю на кнопку "Установить". Обновление устанавливается.', function() {
                                cy.ipcRenderer.enableLogging();

                                cy.button('Установить').click();
                                cy.ipcRenderer.quitAndInstall();
                            });
                            it('Отображена кнопка установки обновления.', function() {
                                cy.notification().should(
                                    'have.text',

                                    'Доступно обновление приложения ' +
                                    'Установить'
                                );
                            });
                        });
                        it('Отображено сообщение о необходимости обновить приложение.', function() {
                            cy.rootMain().should('include.text', 'Статистика вызовов');

                            cy.notification().should(
                                'have.text',

                                'Доступно обновление приложения ' +
                                'Скачать'
                            );
                        });
                    });
                    it('Сообщение о необходимости обновить приложение не отображено.', function() {
                        cy.then(() => cy.tick(2000));
                        cy.notification().should('not.exist');
                    });
                });
                it('Отправлен запрос инициализации вебсокета сотрудников.', function() {
                    cy.employeesWebsocket.initMessage.expectToBeSent();
                });
            });
            it('РМО недоступно.', function() {
                accountRequest.expectToBeSent();
                statusesRequest.expectToBeSent();

                cy.appRoot().should('have.text', '6.2.64 --');
            });
        });
        it('Кнопка "Войти" заблокирована.', () => {
            loginRequest = cy.loginRequest.hold();

            cy.button('Войти').click();
            loginRequest.expectToBeSent();

            cy.button('Войти').should('be.disabled');
        });
    });
    describe(
        'Открываю устаревшую версию десктопного приложения.',
    () => {
        beforeEach(function() {
            cy.visit('https://go.localhost.uis.st:8080', {
                onBeforeLoad(win) {
                    cy.init({ win, version: '6.1.69' });
                },
            });
        });

        describe('Получена версия приложения.', function() {
            beforeEach(function() {
                cy.loginRequest.stub();
                cy.accountRequest.stub();
                cy.tokenRequest.hold();
                cy.reportsListRequest.stub();
                cy.statusesRequest.stub();
                cy.employeesSsoCheckRequest.stub();
                cy.employeeSettingsRequest.hold();
                cy.employeeRequest.hold();

                cy.textField()
                    .withLabel('Логин')
                    .type('botusharova');

                cy.textField()
                    .withLabel('Пароль')
                    .type('8Gls8h31agwLf5k');

                cy.button('Войти').click();
                cy.employeesWebsocket.connect().then(() => cy.clock());

                cy.ipcRenderer.appVersion();
            });

            describe('Получено обновление.', function() {
                beforeEach(function() {
                    cy.ipcRenderer.updateAvailable();
                    cy.then(() => cy.tick(2000));
                });

                describe('Нажимаю на кнопку "Обновить приложение".', function() {
                    beforeEach(function() {
                        cy.button('Обновить приложение').click();
                        cy.ipcRenderer.downloadUpdate();
                    });
                    
                    it('Обновление скачано. Нажимаю на кнопку "Установить". Обновление устанавливается.', function() {
                        cy.ipcRenderer.updateDownloaded();

                        cy.button('Установить приложение').click();
                        cy.ipcRenderer.quitAndInstall();
                    });
                    it('Кнопка обновления заблокирована.', function() {
                        cy.button('Обновить приложение').should('be.disabled');
                    });
                });
                it('Отображено сообщение о необходимости установить обновление.', function() {
                    cy.rootMain().should(
                        'have.text',

                        'Обновите приложение ' +

                        'Версия приложения 6.1.69. Данная версия больше не поддерживается. Доступна более новая ' +
                        'версия приложения ' +

                        'Обновить приложение'
                    );
                });
            });
            it('Сообщение о необходимости обновить приложение не отображено.', function() {
                cy.rootMain().should('include.text', 'Статистика вызовов');
            });
        });
    });
    describe(
        'Открываю устаревшую версию десктопного приложения. Открываю окно софтфофона.',
    () => {
        beforeEach(function() {
            cy.visit('https://go.localhost.uis.st:8080/#isSoftphoneMode', {
                onBeforeLoad(win) {
                    cy.init({
                        win,
                        version: '6.1.69',
                        windowId: 'softphone',
                    });
                },
            });

            cy.viewport(366, 629);
        });

        describe('Получена версия приложения.', function() {
            let tokenRequest;

            beforeEach(function() {
                cy.loginRequest.stub();
                cy.accountRequest.stub();
                const tokenRequest = cy.tokenRequest.hold();
                cy.reportsListRequest.stub();
                cy.statusesRequest.stub();
                cy.employeesSsoCheckRequest.stub();
                cy.employeeSettingsRequest.hold();
                cy.employeeRequest.hold();

                cy.textField()
                    .withLabel('Логин')
                    .type('botusharova');

                cy.textField()
                    .withLabel('Пароль')
                    .type('8Gls8h31agwLf5k');

                cy.button('Войти').click();
                tokenRequest.expectToBeSent();

                cy.ipcRenderer.appVersion();
            });

            it('Получено обновление. Отображено сообщение о необходимости установить обновление.', function() {
                cy.ipcRenderer.updateAvailable();

                cy.rootMain().should(
                    'have.text',

                    'Обновите приложение ' +

                    'Версия приложения 6.1.69. Данная версия больше не поддерживается. Доступна более новая ' +
                    'версия приложения ' +

                    'Обновить приложение'
                );
            });
            it('Сообщение о необходимости обновить приложение не отображено.', function() {
                cy.textField().
                    withPlaceholder('Введите номер').
                    should('exist');
            });
        });
    });
});
