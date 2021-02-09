tests.addTest(function (options) {
    const {ConsultantTester, spendTime, ajax, notificationTester} = options;

    describe('Аутентифицируюсь.', function() {
        let tester;

        beforeEach(function() {
            const notificationsContainer = document.querySelector('.ant-notification span');
            notificationsContainer && (notificationsContainer.innerHTML = '');

            ajax.expectSomeRequestsToBeSent();

            tester = new ConsultantTester(options);
            tester.path.open('/');

            tester.textfield().withPlaceholder('Логин').fill('t.daskalova');
            tester.textfield().withPlaceholder('Пароль').fill('2G892H4gsGjk12ef');

            tester.button('Войти').click();
            spendTime(0);
            spendTime(0);
            tester.infoRequest().receiveResponse();
            tester.connectWebSocket();
            tester.loginUserRequest().receiveResponse();
            notificationTester.grantPermission();
            tester.operatorsRequest().receiveResponse();
            tester.operatorsGroupsRequest().receiveResponse();
            tester.sitesRequest().receiveResponse();
            tester.systemMessagesRequest().receiveResponse();
            tester.marksRequest().receiveResponse();
            tester.visitorStatesRequest().receiveResponse();
            tester.inviteStatusesRequest().receiveResponse();
            tester.answerTemplatesRequest().receiveResponse();
            tester.operatorReadyRequest().receiveResponse();
            const chatsRequest = tester.chatsRequest().expectToBeSent();
            tester.visitorsRequest().receiveResponse();
            chatsRequest.receiveResponse();
            tester.pingRequest().expectToBeSent();
            tester.componentsRequest().receiveResponse();
            tester.objectMarksRequest().receiveResponse();
            tester.objectMarksRequest().setSecondChat().receiveResponse();
            tester.objectMarksRequest().setThirdChat().receiveResponse();
            tester.operatorStatusUpdatingRequest().expectToBeSent();
        });

        describe('Открываю раздел "Чаты".', function() {
            beforeEach(function() {
                tester.menuitem('Чаты').click();
            });

            describe('Посетитель Яндекса ушел. Нажимаю на чат Яндекса.', function() {
                beforeEach(function() {
                    tester.visitorRemovingMessage().receive();
                    spendTime(10000);
                });

                it('Отображен заголовок, рядом с которым отображено состояние offline.', function() {
                    tester.chatCard().withSite('second-site.com').click();
                    tester.chatHeader().onlineIndicator().expectNotToExist();
                    tester.chatHeader().expectToHaveTextContent('offline (Яндекс чат)');
                });
                it('Индикатор состояния отсутствует.', function() {
                    tester.chatCard().withSite('second-site.com').onlineIndicator().expectNotToExist();
                });
            });
            it(
                'Нажимаю на чат CoMagic. Отображен заголовок, рядом с которым отображено состояние и не отображена ' +
                'иконка.',
            function() {
                tester.chatCard().withHeader('Ана Аначкова').click();
                tester.chatHeader().expectToHaveTextContent('Ана Аначкова online');
                tester.chatHeader().typeIcon().expectNotToExist();
            });
            it(
                'Нажимаю на чат Яндекса. Отображен заголовок, рядом с которым отображена иконка, состояние и тип ' +
                'посетителя.',
            function() {
                tester.chatCard().withHeader('Галя Балабанова').click();
                tester.chatHeader().expectToHaveTextContent('Галя Балабанова online (Яндекс чат)');
                tester.chatHeader().typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
                tester.chatHeader().onlineIndicator().expectToBeVisible();
            });
            it(
                'Нажимаю на чат WhatsApp. Отображен заголовок, рядом с которым отображена иконка, состояние и тип ' +
                'посетителя.',
            function() {
                tester.chatCard().withHeader('Милка Стоенчева').click();

                tester.chatHeader().expectToHaveTextContent('Милка Стоенчева online (WhatsApp)');
                tester.chatHeader().typeIcon().expectAttributeToHaveValue('data-type', 'whatsapp');
                tester.chatHeader().onlineIndicator().expectToBeVisible();
            });
            it('Рядом с чатом Яндекса отображена иконка. Отображен индикатор состояния.', function() {
                tester.chatHeader().expectToHaveTextContent('');

                tester.chatCard().withSite('second-site.com').onlineIndicator().expectToBeVisible();

                tester.chatCard().withHeader('Ана Аначкова').typeIcon().expectNotToExist();
                tester.chatCard().withHeader('Галя Балабанова').typeIcon().
                    expectAttributeToHaveValue('data-type', 'yandex');
            });
        });
        it('Открываю раздел "Операторы". Рядом с оператор, находящимся онлайн отображен индикатор.', function() {
            tester.menuitem('Операторы').click();

            tester.chatCard().withHeader('Зорка Антонова').onlineIndicator().expectNotToExist();
            tester.chatCard().withHeader('Катерина Помакова').onlineIndicator().expectToBeVisible();
        });
        it('Поступило обращение от посетителя CoMagic. В оповещении отображена иконка почты.', function() {
            tester.visitorUpdateMessage().receive();

            tester.notification().expectToHaveTextContent(
                'Новый чат от посетителя Ана Аначкова ' +
                'Принять чат'
            );

            tester.notification().typeIcon().expectToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectNotToHaveAttribute('data-type');
        });
        it('Поступило обращение от посетителя Яндекса. В оповещении отображена иконка Яндекса.', function() {
            tester.visitorUpdateMessage().setSecondVisitor().receive();

            tester.notification().expectToHaveTextContent(
                'Новый чат от посетителя Галя Балабанова ' +
                'Принять чат'
            );

            tester.notification().typeIcon().expectNotToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
        });
        it('Поступило сообщение от посетителя CoMagic. В оповещении отображена иконка почты.', function() {
            tester.chatMessageMessage().receive();

            tester.notification().expectToHaveTextContent(
                'Сообщение от посетителя Ана Аначкова ' +
                'Здравствуйте. Мне нужна помощь. ' +
                'Ответить'
            );

            tester.notification().typeIcon().expectToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectNotToHaveAttribute('data-type');
        });
        it('Поступило сообщение от посетителя Яндекса. В оповещении отображена иконка Яндекса.', function() {
            tester.chatMessageMessage().setSecondVisitor().receive();

            tester.notification().expectToHaveTextContent(
                'Сообщение от посетителя Галя Балабанова ' +
                'Здравствуйте. Мне нужна помощь. ' +
                'Ответить'
            );

            tester.notification().typeIcon().expectNotToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
        });
        it('Поступило сообщение от посетителя WhatsApp. В оповещении отображена иконка WhatsApp.', function() {
            tester.chatMessageMessage().setThirdVisitor().receive();

            tester.notification().expectToHaveTextContent(
                'Сообщение от посетителя Милка Стоенчева ' +
                'Здравствуйте. Мне нужна помощь. ' +
                'Ответить'
            );

            tester.notification().typeIcon().expectNotToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectAttributeToHaveValue('data-type', 'whatsapp');
        });
        it('Поступило сообщение от оператора. В оповещении отображена иконка почты.', function() {
            tester.ocMessageMessage().receive();

            tester.notification().expectToHaveTextContent(
                'Сообщение от оператора Зорка Антонова ' +
                'Привет! ' +
                'Ответить'
            );

            tester.notification().typeIcon().expectToHaveClass('anticon-mail');
            tester.notification().typeIcon().expectNotToHaveAttribute('data-type');
        });
        it('Рядом с именем посетителей Яндекса и WhatsApp отображена иконка.', function() {
            tester.visitorCard('Ана Аначкова').typeIcon().expectNotToExist();
            tester.visitorCard('Галя Балабанова').typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
            tester.visitorCard('Милка Стоенчева').typeIcon().expectAttributeToHaveValue('data-type', 'whatsapp');
        });
    });
});
