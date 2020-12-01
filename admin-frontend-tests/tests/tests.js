tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        AdminFrontendTester = options.AdminFrontendTester,
        spendTime = options.spendTime,
        setNow = options.setNow,
        ajax = options.ajax,
        utils = options.utils,
        webSockets = options.webSockets,
        audioDecodingTester = options.audioDecodingTester,
        setFocus = options.setFocus,
        notificationTester = options.notificationTester,
        webSockets = options.webSockets,
        openPath = options.openPath;

    webSocketLogger.disable();
    timeoutLogger.disable();

    xdescribe('Открываю главную страницу.', function() {
        let tester;

        beforeEach(function() {
            tester = new AdminFrontendTester(options);

            tester.textfield().withPlaceholder('Username').fill('s.karamanova');
            tester.textfield().withPlaceholder('Password').fill('2i3g8h89sdG32r');

            tester.button('Sign in').click();
            Promise.runAll();
            tester.userLoginRequest().receiveResponse();
        });

        xit(
            'Доступны разделы "Пользователи" и "Переотправка событий". Отображены пункты меню "Пользователи" и ' +
            '"Переотправка событий".',
        function() {
            tester.userRequest().allowReadEventResending().allowReadUsers().receiveResponse();

            tester.menuitem('Переотправка событий').expectHrefToHavePath('/event-resending');
            tester.menuitem('Переотправка событий').expectAttributeToHaveValue('target', '_blank');
            tester.menuitem('Пользователи').expectNotToHaveAttribute('target');
        });
        it('Доступен только раздел "Пользовтатели". Отображен только пункт меню "Пользователи".', function() {
            tester.userRequest().allowReadUsers().receiveResponse();

            tester.menuitem('Переотправка событий').expectNotToExist();
            tester.menuitem('Пользователи').expectToBeVisible();

            tester.root.expectToHaveTextContent(
                'Новосистем ' +
                'Admin Panel ' +
                'Пользователи ' +

                'Пользователи ' +

                'Фильтры: Пользователь софтфона Применить ' +

                'App ID ' +
                'Customer ID ' +
                'Имя клиента ' +
                'Пользователь ' +
                'Сотрудник ' +
                'Логин в софтфоне ' +
                'Номер ' +

                'Нет данных ' +

                '1 ' +
                'Строк на странице 50 ' +
                'Всего записей 0'
            );
        });
    });
    describe('Открываю раздел "Переотправка событий".', function() {
        let tester;

        beforeEach(function() {
            tester = new AdminFrontendTester(options);

            tester.textfield().withPlaceholder('Username').fill('s.karamanova');
            tester.textfield().withPlaceholder('Password').fill('2i3g8h89sdG32r');

            tester.button('Sign in').click();
            Promise.runAll();
            tester.userLoginRequest().receiveResponse();
            tester.userRequest().allowReadEventResending().allowReadUsers().receiveResponse();

            openPath('/event-resending');
            Promise.runAll();
        });

        it('Стандартный лэйаут не используется.', function() {
            tester.root.expectTextContentNotToHaveSubstring('Новосистем Admin Panel');
        });
    });
});
