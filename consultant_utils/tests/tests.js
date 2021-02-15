tests.addTest(function (options) {
    const {ConsultantTester, spendTime, ajax, notificationTester} = options;

    describe('Некоторые запросы могли уже быть отправлены.', function() {
        beforeEach(function() {
            ajax.expectSomeRequestsToBeSent();
        });

        describe('Ввожу логин и пароль.', function() {
            let tester,
                loginUserRequest;

            beforeEach(function() {
                tester = new ConsultantTester(options);
                tester.path.open('/');

                tester.textfield().withPlaceholder('Логин').fill('t.daskalova');
                tester.textfield().withPlaceholder('Пароль').fill('2G892H4gsGjk12ef');

                tester.button('Войти').click();
                spendTime(0);
                spendTime(0);
                tester.infoRequest().receiveResponse();
                tester.connectWebSocket();
                loginUserRequest = tester.loginUserRequest().expectToBeSent();
            });

            describe('Аутентфикация проведена успешно.', function() {
                let chatsRequest,
                    visitorsRequest;

                beforeEach(function() {
                    loginUserRequest.receiveResponse();
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
                    chatsRequest = tester.chatsRequest().expectToBeSent();
                    visitorsRequest = tester.visitorsRequest().expectToBeSent();
                    tester.pingRequest().expectToBeSent();
                    tester.componentsRequest().receiveResponse();
                    tester.operatorStatusUpdatingRequest().expectToBeSent();
                });

                describe('Сначала были получены посетители, а потом были получены чаты.', function() {
                    beforeEach(function() {
                        visitorsRequest.receiveResponse();
                        chatsRequest.receiveResponse();
                        tester.objectMarksRequest().receiveResponse();
                        tester.objectMarksRequest().setSecondChat().receiveResponse();
                        tester.objectMarksRequest().setThirdChat().receiveResponse();
                        tester.objectMarksRequest().setAnotherChats(0, 99).receiveResponse();
                    });

                    describe('Открываю раздел "Чаты".', function() {
                        beforeEach(function() {
                            tester.menuitem('Чаты').click();
                        });

                        describe('Посетитель Яндекса ушел.', function() {
                            beforeEach(function() {
                                tester.visitorRemovingMessage().receive();
                                spendTime(10000);
                            });

                            it(
                                'Нажимаю на чат Яндекса. Отображен заголовок, рядом с которым отображено состояние ' +
                                'offline.',
                            function() {
                                tester.chatCard().withSite('second-site.com').click();
                                tester.chatHeader().onlineIndicator().expectNotToExist();
                                tester.chatHeader().expectToHaveTextContent('offline (Яндекс чат)');
                            });
                            it('Индикатор состояния рядом с Яндекс чатом отсутствует.', function() {
                                tester.chatCard().withSite('second-site.com').onlineIndicator().expectNotToExist();
                            });
                        });
                        describe('Нажимаю на чат WhatsApp.', function() {
                            beforeEach(function() {
                                tester.chatCard().withHeader('Милка Стоенчева').click();
                            });

                            it(
                                'Нажимаю на кнопку "Завершить чат". Во вкладке "Завершенные" отображен завершенный ' +
                                'чат.',
                            function() {
                                tester.button('Завершить чат').click();
                                tester.chatClosingRequest().receiveResponse();

                                tester.tabpanel().tab().active().expectTextContentToHaveSubstring(
                                    'Милка Стоенчева fourth-site.com ' +
                                    'Денка Налбантова Приветствую вас в 1-й раз! 14 Нояб 2019 fifth-site.com'
                                );
                            });
                            it('Нажимаю на кнопку тегов. Отображены выбранные теги.', function() {
                                tester.chatTagIcon.click();

                                tester.body.expectTextContentToHaveSubstring(
                                    'Выбранные теги: Очистить все ' +
                                    'Генератор лидов * ' +
                                    'Подозрительный звонок ' +
                                    'Все теги:'
                                );
                            });
                            it(
                                'Отображен заголовок, рядом с которым отображена иконка, состояние и тип посетителя.',
                            function() {
                                tester.chatHeader().expectToHaveTextContent('Милка Стоенчева online (WhatsApp)');
                                tester.chatHeader().typeIcon().expectAttributeToHaveValue('data-type', 'whatsapp');
                                tester.chatHeader().onlineIndicator().expectToBeVisible();
                            });
                        });
                        describe('Нажимаю на чат CoMagic.', function() {
                            beforeEach(function() {
                                tester.chatCard().withHeader('Ана Аначкова').click();
                            });

                            it('Нажимаю на кнопку тегов. Отображены выбранные теги.', function() {
                                tester.chatTagIcon.click();

                                tester.body.expectTextContentToHaveSubstring(
                                    'Выбранные теги: Очистить все ' +
                                    'Продажа * ' +
                                    'Отложенный звонок * ' +
                                    'Все теги:'
                                );
                            });
                            it(
                                'Отображен заголовок, рядом с которым отображено состояние и не отображена иконка.',
                            function() {
                                tester.chatHeader().expectToHaveTextContent('Ана Аначкова online');
                                tester.chatHeader().typeIcon().expectNotToExist();
                            });
                        });
                        it(
                            'Нажимаю на чат Яндекса. Отображен заголовок, рядом с которым отображена иконка, ' +
                            'состояние и тип посетителя.',
                        function() {
                            tester.chatCard().withHeader('Галя Балабанова').click();
                            tester.chatHeader().expectToHaveTextContent('Галя Балабанова online (Яндекс чат)');
                            tester.chatHeader().typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
                            tester.chatHeader().onlineIndicator().expectToBeVisible();
                        });
                        it('Изменен сайт посетителя. Отображен новый сайт.', function() {
                            tester.visitorUpdateMessage().setThirdSite().receive();

                            tester.chatCard().withHeader('Ана Аначкова').
                                expectToHaveTextContent('Ана Аначкова third-site.com');
                        });
                        it(
                            'Рядом с чатом Яндекса отображена иконка. Индикатор состояния отображен рядом с чатами, ' +
                            'посетители которых прибывают онлайн.',
                        function() {
                            tester.chatHeader().expectToHaveTextContent('');

                            tester.chatCard().withSite('second-site.com').onlineIndicator().expectToBeVisible();

                            tester.chatCard().withHeader('Ана Аначкова').
                                expectToHaveTextContent('Ана Аначкова first-site.com');
                            tester.chatCard().withHeader('Ана Аначкова').typeIcon().expectNotToExist();

                            tester.chatCard().withHeader('Галя Балабанова').typeIcon().
                                expectAttributeToHaveValue('data-type', 'yandex');
                        });
                    });
                    describe('Клиент завершил чат.', function() {
                        beforeEach(function() {
                            tester.chatClosingMessage().receive();
                            tester.chatMessageMessage().setThirdVisitor().setChatClosingMessage().receive();
                        });

                        describe(
                            'Перехожу в раздел "Посетители". Нажимаю на кнопку "Пригласить в чат" в карте ' +
                            'посетителя, завершившего чат.',
                        function() {
                            beforeEach(function() {
                                tester.menuitem('Посетители').click();

                                tester.visitorCard('Милка Стоенчева').button('Пригласить в чат').click();
                                tester.chatStartingRequest().receiveResponse();
                                tester.visitorUpdateMessage().setThirdVisitor().setChatStarting().receive();
                                tester.objectMarksRequest().setThirdChat().receiveResponse();
                                tester.chatWatchRequest().receiveResponse();
                            });

                            it(
                                'Открываю вкладку "Завершенные". Открытый снова чат не отображен во вкладке.',
                            function() {
                                tester.tabpanel().tab('Завершенные').click();
                                tester.tabpanel().tab().active().expectTextContentNotToHaveSubstring('Милка Стоенчева');
                            });
                            it('Открытый снова чат отображается во вкладке "Чаты".', function() {
                                tester.tabpanel().tab().active().expectToHaveTextContent(
                                    'Ана Аначкова first-site.com ' +
                                    'Галя Балабанова second-site.com ' +
                                    'Милка Стоенчева Здравствуйте. Мне снова нужна помощь. 14 Нояб 2019 fourth-site.com'
                                );
                            });
                        });
                        it(
                            'Нажимаю на кнпоку "Открыть чат". Открытый снова чат отображается во вкладке "Чаты".',
                        function() {
                            tester.button('Открыть чат').click();
                            tester.chatStartingRequest().receiveResponse();
                            tester.visitorUpdateMessage().setThirdVisitor().setChatStarting().receive();
                            tester.objectMarksRequest().setThirdChat().receiveResponse();
                            tester.chatWatchRequest().receiveResponse();

                            tester.tabpanel().tab('Чаты').click();

                            tester.tabpanel().tab().active().expectToHaveTextContent(
                                'Ана Аначкова first-site.com ' +
                                'Галя Балабанова second-site.com ' +
                                'Милка Стоенчева Здравствуйте. Мне снова нужна помощь. 14 Нояб 2019 fourth-site.com'
                            );
                        });
                        it('Завершенный чат не отображается во вкладке "Чаты".', function() {
                            tester.tabpanel().tab('Чаты').click();

                            tester.tabpanel().tab().active().expectToHaveTextContent(
                                'Ана Аначкова first-site.com ' +
                                'Галя Балабанова second-site.com'
                            );
                        });
                        it('Чат отображен во вкладке "Завершенные".', function() {
                            tester.tabpanel().tab().active().expectTextContentToHaveSubstring(
                                'Милка Стоенчева fourth-site.com ' +
                                'Денка Налбантова Приветствую вас в 1-й раз! 14 Нояб 2019 fifth-site.com'
                            );
                        });
                    });
                    it(
                        'Открываю раздел "Операторы". Рядом с оператором, находящимся онлайн отображен индикатор.',
                    function() {
                        tester.menuitem('Операторы').click();

                        tester.chatCard().withHeader('Зорка Антонова').onlineIndicator().expectNotToExist();
                        tester.chatCard().withHeader('Катерина Помакова').onlineIndicator().expectToBeVisible();
                    });
                    it(
                        'Поступило обращение от посетителя CoMagic. В оповещении отображена иконка почты. Посетители ' +
                        'не дублируются.',
                    function() {
                        tester.visitorUpdateMessage().setWaiting().receive();

                        tester.notification().expectToHaveTextContent(
                            'Новый чат от посетителя Ана Аначкова ' +
                            'Принять чат'
                        );

                        tester.notification().typeIcon().expectToHaveClass('anticon-mail');
                        tester.notification().typeIcon().expectNotToHaveAttribute('data-type');

                        tester.visitorCard('Ана Аначкова').expectToBeVisible();
                    });
                    it(
                        'Пришло сообщение об изменении неизвестного посетителя без времени. Запрошен посетитель.' +
                        'Отображен новый посетитель.',
                    function() {
                        tester.visitorUpdateMessage().setSeventhVisitor().setNoStartTime().receive();
                        tester.visitorRequest().receiveResponse();

                        tester.visitorCard('Божанка Гяурова').expectToBeVisible();
                    });
                    it(
                        'Поступило обращение от посетителя Яндекса. В оповещении отображена иконка Яндекса.',
                    function() {
                        tester.visitorUpdateMessage().setWaiting().setSecondVisitor().receive();

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
                    it(
                        'Поступило сообщение от посетителя Яндекса. В оповещении отображена иконка Яндекса.',
                    function() {
                        tester.chatMessageMessage().setSecondVisitor().receive();

                        tester.notification().expectToHaveTextContent(
                            'Сообщение от посетителя Галя Балабанова ' +
                            'Здравствуйте. Мне нужна помощь. ' +
                            'Ответить'
                        );

                        tester.notification().typeIcon().expectNotToHaveClass('anticon-mail');
                        tester.notification().typeIcon().expectAttributeToHaveValue('data-type', 'yandex');
                    });
                    it(
                        'Поступило сообщение от посетителя WhatsApp. В оповещении отображена иконка WhatsApp.',
                    function() {
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
                    it(
                        'Открываю раздел "Чаты". Открываю вкладку "Завершенные". Отображены завершенные чаты.',
                    function() {
                        tester.menuitem('Чаты').click();
                        tester.tabpanel().tab('Завершенные').click();

                        tester.tabpanel().tab().active().chatCard().withHeader('Ана Аначкова').expectNotToExist();

                        tester.tabpanel().tab().active().chatCard().withLastMessage('Приветствую вас в 1-й раз!').
                            expectToBeVisible();
                    });
                    it('Окрываю несуществующий чат. Отобржаена главная страница.', function() {
                        tester.path.open('/chats/closed/121181077');
                        tester.visitorCard('Ана Аначкова').expectToBeVisible();
                    });
                    it(
                        'Рядом с именем посетителей Яндекса и WhatsApp отображена иконка. Логин и пароль был ' +
                        'сохранен в локальном хранилище.',
                    function() {
                        tester.visitorCard('Ана Аначкова').typeIcon().expectNotToExist();
                        tester.visitorCard('Галя Балабанова').typeIcon().
                            expectAttributeToHaveValue('data-type', 'yandex');
                        tester.visitorCard('Милка Стоенчева').typeIcon().expectAttributeToHaveValue('data-type',
                            'whatsapp');

                        tester.expectLoginToEqual('t.daskalova');
                        tester.expectPassordToEqual('2G892H4gsGjk12ef');
                    });
                });
                describe('Поеститель, связанный с чатом отсутствует.', function() {
                    beforeEach(function() {
                        visitorsRequest.ommitVisitor().receiveResponse();
                        chatsRequest.receiveResponse();
                        tester.objectMarksRequest().receiveResponse();
                        tester.objectMarksRequest().setSecondChat().receiveResponse();
                        tester.objectMarksRequest().setThirdChat().receiveResponse();
                        tester.objectMarksRequest().setAnotherChats(0, 99).receiveResponse();
                    });

                    it('Окрываю несуществующий чат. Отобржаена главная страница.', function() {
                        tester.path.open('/chats/active/92741841');
                        tester.visitorCard('Ана Аначкова').expectToBeVisible();
                    });
                    it('Чат не отображен в списке чатов.', function() {
                        tester.menuitem('Чаты').click();
                        tester.chatCard().atIndex(2).expectNotToExist();
                    });
                });
                it(
                    'Сначала были получены чаты, а потом были получены посетители. Открываю раздел "Чаты". ' +
                    'Отображены имена и сайты.',
                function() {
                    chatsRequest.receiveResponse();
                    visitorsRequest.receiveResponse();
                    tester.objectMarksRequest().receiveResponse();
                    tester.objectMarksRequest().setSecondChat().receiveResponse();
                    tester.objectMarksRequest().setThirdChat().receiveResponse();
                    tester.objectMarksRequest().setAnotherChats(0, 99).receiveResponse();

                    tester.menuitem('Чаты').click();

                    tester.tabpanel().tab().active().expectToHaveTextContent(
                        'Ана Аначкова first-site.com ' +
                        'Галя Балабанова second-site.com ' +
                        'Милка Стоенчева fourth-site.com'
                    );
                });
            });
            it(
                'Не удалось произвести аутентфикацию. Отображено сообщение об ошибке. Логин и пароль не был сохранен ' +
                'в локальном хранилище.',
            function() {
                loginUserRequest.setUnsuccessfull().receiveResponse();

                tester.message().expectToHaveTextContent('Неправильный логин или пароль');
                tester.expectLoginToEqual('');
                tester.expectPassordToEqual('');
            });
        });
        describe('В локальном хранилище сохранен логин и пароль.', function() {
            let tester,
                loginUserRequest;

            beforeEach(function() {
                window.localStorage.setItem('login', 't.daskalova');
                window.localStorage.setItem('password', '2G892H4gsGjk12ef');

                tester = new ConsultantTester(options);
                tester.path.open('/');
                spendTime(0);
                spendTime(0);
                tester.infoRequest().receiveResponse();
                tester.connectWebSocket();
            });

            describe('Отправлен запрос аутентификации.', function() {
                beforeEach(function() {
                    loginUserRequest = tester.loginUserRequest().expectToBeSent();
                });

                describe('Аутентфикация проведена успешно.', function() {
                    beforeEach(function() {
                        tester.flushUpdates();
                        loginUserRequest.receiveResponse();

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
                        tester.objectMarksRequest().setAnotherChats(0, 99).receiveResponse();
                        tester.operatorStatusUpdatingRequest().expectToBeSent();
                    });

                    it('Нажимаю на свое имя. Нажимаю на кнопку "Выход". Отображена форма аутентификации.', function() {
                        tester.logoOperator.click();

                        tester.a('Выход').click();
                        tester.logoutMessage().expectToBeSent();
                        tester.finishWebSocketDisconnecting();

                        tester.textfield().withPlaceholder('Логин').expectToBeVisible();
                    });
                    it('Логин и пароль был сохранен в локальном хранилище.', function() {
                        tester.expectLoginToEqual('t.daskalova');
                        tester.expectPassordToEqual('2G892H4gsGjk12ef');
                    });
                });
                it(
                    'Не удалось произвести аутентфикацию. Отображено сообщение об ошибке. Логин и пароль не был ' +
                    'сохранен в локальном хранилище.',
                function() {
                    tester.flushUpdates();
                    loginUserRequest.setUnsuccessfull().receiveResponse();

                    tester.message().expectToHaveTextContent('Неправильный логин или пароль');
                    tester.expectLoginToEqual('');
                    tester.expectPassordToEqual('');
                });
            });
            it('Форма аутентификации скрыта.', function() {
                tester.expectSomeMessagesToBeSent();
                tester.textfield().withPlaceholder('Логин').expectNotToExist();
            });
        });
    });
});
