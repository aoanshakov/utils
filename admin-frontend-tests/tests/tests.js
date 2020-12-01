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

        describe('Доступны разделы "Пользователи" и "Переотправка событий".', function() {
            beforeEach(function() {
                tester.userRequest().allowReadEventResending().allowReadUsers().receiveResponse();
            });

            it('Отображены пункты меню "Пользователи" и "Переотправка событий".', function() {
                tester.root.expectToHaveTextContent('Новосистем Admin Panel Пользователи Переотправка событий');
                tester.menuitem('Переотправка событий').expectHrefToHavePath('/event-resending');
                tester.menuitem('Переотправка событий').expectAttributeToHaveValue('target', '_blank');
                tester.menuitem('Пользователи').expectNotToHaveAttribute('target');
            });
        });
        it('Доступен только раздел "Пользовтатели". Отображен только пункт меню "Пользователи".', function() {
            tester.userRequest().allowReadUsers().receiveResponse();
            tester.root.expectToHaveTextContent('Новосистем Admin Panel Пользователи');
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

        it('', function() {
        });
    });
});
