tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener,
        triggerMutation,
        mutationObserverMocker,
        ajax,
        fetch
    } = options;

    afterEach(function() {
        spendTime(0);
    });

    describe(
        'Открывый новый личный кабинет. Запрошены данные для отчета. Запрошены настройки софтфона. Запрошены права.',
    function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();
        });

        describe('Фичафлаг софтфона включен.', function() {
            beforeEach(function() {
                accountRequest.receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();

                tester.configRequest().softphone().receiveResponse();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();
                permissionsRequest = tester.permissionsRequest().expectToBeSent();
            });

            describe('Получены права.', function() {
                beforeEach(function() {
                    permissionsRequest.receiveResponse();
                });

                describe('Получены настройки софтфона.', function() {
                    let authenticatedUserRequest,
                        registrationRequest;

                    beforeEach(function() {
                        settingsRequest.receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        registrationRequest = tester.registrationRequest().expectToBeSent();
                    });

                    describe('Получен доступ к микрофону.', function() {
                        beforeEach(function() {
                            tester.allowMediaInput();
                        });

                        describe('SIP-линия зарегистрирована.', function() {
                            beforeEach(function() {
                                authenticatedUserRequest.receiveResponse();
                            });

                            describe('Получены данные для отчета.', function() {
                                beforeEach(function() {
                                    reportGroupsRequest.receiveResponse();
                                });

                                describe('SIP-регистрация завершена. Поступил входящий звонок.', function() {
                                    beforeEach(function() {
                                        registrationRequest.receiveResponse();

                                        tester.incomingCall().receive();
                                        Promise.runAll(false, true);
                                        tester.numaRequest().receiveResponse();
                                    });

                                    describe('Контакт найден.', function() {
                                        beforeEach(function() {
                                            tester.outCallEvent().receive();
                                        });

                                        describe('Принимаю звонок.', function() {
                                            beforeEach(function() {
                                                tester.callButton.click();

                                                tester.firstConnection.connectWebRTC();
                                                tester.firstConnection.callTrackHandler();

                                                tester.allowMediaInput();
                                                tester.firstConnection.addCandidate();
                                                tester.requestAcceptIncomingCall();
                                            });

                                            describe('Нажимаю на кнопку трансфера.', function() {
                                                let usersRequest,
                                                    usersInGroupsRequest;

                                                beforeEach(function() {
                                                    tester.transferButton.click();

                                                    usersRequest = tester.usersRequest().expectToBeSent();
                                                    usersInGroupsRequest = tester.usersInGroupsRequest().
                                                        expectToBeSent();
                                                    tester.groupsRequest().receiveResponse();
                                                });

                                                describe('Сотрдников мало.', function() {
                                                    beforeEach(function() {
                                                        usersRequest.receiveResponse();
                                                        usersInGroupsRequest.receiveResponse();
                                                    });

                                                    describe('Нажимаю на кнопку поиска.', function() {
                                                        beforeEach(function() {
                                                            tester.searchButton.click();
                                                        });

                                                        describe('Ввожу значение в поле поиска.', function() {
                                                            beforeEach(function() {
                                                                tester.softphone.input.fill('ова');
                                                            });

                                                            it(
                                                                'Нажимаю на иконку очищения поля. Отображены все ' +
                                                                'сотрудники.',
                                                            function() {
                                                                tester.softphone.input.clearIcon.click();

                                                                tester.softphone.expectToHaveTextContent(
                                                                    'Сотрудники Группы ' +

                                                                    'ЙБ Божилова Йовка 296 ' +
                                                                    'НГ Господинова Николина 295 ' +
                                                                    'Шалева Дора 8258'
                                                                );
                                                            });
                                                            it('Отображены найденные сотрудники.', function() {
                                                                tester.softphone.expectToHaveTextContent(
                                                                    'ЙБ Божил ова Йовка 296 ' +
                                                                    'НГ Господин ова Николина 295'
                                                                );
                                                            });
                                                        });
                                                        it(
                                                            'Ввожу значение в поле поиска. Ничего не найдено. ' +
                                                            'Отображено сообщение о том, что ничего не найдено.',
                                                        function() {
                                                            tester.softphone.input.fill('йцукен');
                                                            tester.softphone.
                                                                expectToHaveTextContent('Сотрудник не найден');
                                                        });
                                                    });
                                                    describe('Открываю вкладку групп.', function() {
                                                        beforeEach(function() {
                                                            tester.button('Группы').click();
                                                        });

                                                        it(
                                                            'Соединение разрывается. Кнопка звонка заблокирована.',
                                                        function() {
                                                            tester.disconnectEventsWebSocket();
                                                            tester.employeeRow('Отдел дистрибуции').expectToBeDisaled();
                                                        });
                                                        it('Отображена таблица групп.', function() {
                                                            tester.employeeRow('Отдел дистрибуции').expectToBeEnabled();

                                                            tester.softphone.expectToHaveTextContent(
                                                                'Сотрудники Группы ' +

                                                                'Отдел дистрибуции 298 1 /1 ' +
                                                                'Отдел по работе с ключевыми клиентами 726 0 /1 ' +
                                                                'Отдел региональных продаж 828 2 /2'
                                                            );
                                                        });
                                                    });
                                                    it('Нажимаю на строку в таблице сотрудника.', function() {
                                                        tester.employeeRow('Господинова Николина').click();

                                                        tester.dtmf('#').send();
                                                        spendTime(600);
                                                        tester.dtmf('2').send();
                                                        spendTime(600);
                                                        tester.dtmf('9').send();
                                                        spendTime(600);
                                                        tester.dtmf('5').send();
                                                        spendTime(600);

                                                        tester.transferButton.click();

                                                        tester.dtmf('#').send();
                                                    });
                                                    it('Отображена таблица сотрудников.', function() {
                                                        tester.softphone.expectToHaveTextContent(
                                                            'Сотрудники Группы ' +

                                                            'ЙБ Божилова Йовка 296 ' +
                                                            'НГ Господинова Николина 295 ' +
                                                            'Шалева Дора 8258'
                                                        );

                                                        tester.employeeRow('Божилова Йовка').transferIcon.
                                                            expectToBeVisible();
                                                        tester.employeeRow('Божилова Йовка').expectToBeDisaled();
                                                        tester.employeeRow('Шалева Дора').expectToBeEnabled();
                                                    });
                                                });
                                                it('Сотрудников много.', function() {
                                                    usersRequest.addMore().receiveResponse();
                                                    usersInGroupsRequest.addMore().receiveResponse();
                                                });
                                            });
                                            it('Отображено направление и номер.', function() {
                                                tester.incomingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                );
                                            });
                                        });
                                        it('Нажимаю на кнопку открытия контакта.', function() {
                                            tester.contactOpeningButton.click();

                                            windowOpener.expectToHavePath(
                                                'https://comagicwidgets.amocrm.ru/contacts/detail/382030'
                                            );
                                        });
                                        it('Нажимаю на кнопку сворачивания виджета. Виджет свернут.', function() {
                                            tester.collapsednessToggleButton.click();

                                            tester.collapsednessToggleButton.
                                                expectToHaveClass('expand_svg__cmg-expand-icon');

                                            tester.softphone.expectTextContentNotToHaveSubstring('Путь лида');
                                        });
                                        it('Отображена информация о контакте.', function() {
                                            tester.collapsednessToggleButton.
                                                expectToHaveClass('collapse_svg__cmg-collapse-icon');

                                            tester.contactOpeningButton.expectNotToHaveClass('cmg-button-disabled');
                                            tester.incomingIcon.expectToBeVisible();

                                            tester.softphone.expectTextContentToHaveSubstring(
                                                'Шалева Дора +7 (916) 123-45-67 ' +
                                                'Путь лида'
                                            );

                                            tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                                            tester.secondLineButton.expectNotToHaveClass('cmg-bottom-button-selected');
                                        });
                                    });
                                    describe('Звонок переведен от другого сотрудника.', function() {
                                        beforeEach(function() {
                                            tester.outCallEvent().isTransfer().receive();
                                        });

                                        it('Принимаю звонок. Отображен знак трансфера номер и таймер.', function() {
                                            tester.callButton.click();

                                            tester.firstConnection.connectWebRTC();
                                            tester.firstConnection.callTrackHandler();

                                            tester.allowMediaInput();
                                            tester.firstConnection.addCandidate();
                                            tester.requestAcceptIncomingCall();

                                            tester.transferIncomingIcon.expectToBeVisible();
                                            tester.softphone.expectTextContentToHaveSubstring(
                                                'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                            );
                                        });
                                        it('Отображено сообщение о переводе звонка.', function() {
                                            tester.incomingIcon.expectNotToExist();
                                            tester.outgoingIcon.expectNotToExist();

                                            tester.softphone.expectTextContentToHaveSubstring(
                                                'Шалева Дора +7 (916) 123-45-67 Трансфер от Бисерка Макавеева'
                                            );
                                        });
                                    });
                                    describe('Звонок производится в рамках исходящего обзвона.', function() {
                                        var outCallEvent;

                                        beforeEach(function() {
                                            outCallEvent = tester.outCallEvent().autoCallCampaignName();
                                        });

                                        it(
                                            'Имя контакта отсутствует. Звонок обозначен, как исходящий обзвон.',
                                        function() {
                                            outCallEvent.noName().receive();

                                            tester.outgoingIcon.expectToBeVisible();
                                            tester.softphone.expectTextContentToHaveSubstring(
                                                '+7 (916) 123-45-67 Исходящий обзвон'
                                            );
                                        });
                                        it('Звонок отображается как исходящий.', function() {
                                            outCallEvent.receive();

                                            tester.outgoingIcon.expectToBeVisible();
                                            tester.softphone.expectTextContentToHaveSubstring(
                                                'Шалева Дора +7 (916) 123-45-67'
                                            );
                                        });
                                    });
                                    it(
                                        'Контакт не найден. Отображно направление звонка. Кнопка открытия контакта ' +
                                        'заблокирована.',
                                    function() {
                                        tester.outCallEvent().noName().noCrmContactLink().receive();
                                        tester.contactOpeningButton.click();

                                        tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                                        windowOpener.expectNoWindowToBeOpened();

                                        tester.incomingIcon.expectToBeVisible();
                                        tester.softphone.expectTextContentToHaveSubstring(
                                            '+7 (916) 123-45-67 Входящий звонок'
                                        );
                                    });
                                    it('Открытые сделки существуют. Открытые сделки отображены.', function() {
                                        tester.outCallEvent().activeLeads().receive();

                                        tester.anchor('По звонку с 79154394340').expectHrefToHavePath(
                                            'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                        );
                                    });
                                    it('У контакта длинное имя.', function() {
                                        tester.outCallEvent().longName().receive();
                                    });
                                    it('Отображено сообщение о поиске контакта.', function() {
                                        tester.collapsednessToggleButton.expectNotToExist();
                                        tester.contactOpeningButton.expectNotToExist();
                                        tester.incomingIcon.expectToBeVisible();
                                        tester.softphone.expectTextContentToHaveSubstring(
                                            '+7 (916) 123-45-67 Поиск контакта...'
                                        );
                                    });
                                });
                                describe('Нажимаю на иконку с телефоном.', function() {
                                    beforeEach(function() {
                                        tester.button('Софтфон').click();
                                    });

                                    describe('Ввожу номер телефона.', function() {
                                        beforeEach(function() {
                                            tester.phoneField.fill('79161234567');
                                        });

                                        describe('SIP-регистрация завершена. Нажимаю на кнпоку вызова.', function() {
                                            let numaRequest,
                                                outboundCall;

                                            beforeEach(function() {
                                                registrationRequest.receiveResponse();

                                                tester.callButton.click();
                                                
                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                outboundCall = tester.outboundCall().start().setRinging();
                                                tester.firstConnection.callTrackHandler();

                                                numaRequest = tester.numaRequest().expectToBeSent();
                                            });

                                            describe('Контакт не является сотрудником.', function() {
                                                beforeEach(function() {
                                                    numaRequest.receiveResponse();
                                                });

                                                describe('Получены данные контакта.', function() {
                                                    beforeEach(function() {
                                                        tester.outCallSessionEvent().receive();
                                                    });

                                                    it('Звонок принят. Отображено имя, номер и таймер.', function() {
                                                        outboundCall.setAccepted();

                                                        tester.outgoingIcon.expectToBeVisible();
                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                        );
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку остановки звонка. Ввожу тот же самый ' +
                                                        'номер. Отображается поле номера.',
                                                    function() {
                                                        tester.stopCallButton.click();
                                                        tester.requestCancelOutgoingCall();

                                                        tester.phoneField.fill('79161234567');

                                                        tester.phoneField.expectToHaveValue('79161234567');
                                                    });
                                                    it('Отображено имя, номер и таймер.', function() {
                                                        tester.outgoingIcon.expectToBeVisible();
                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                        );
                                                    });
                                                });
                                                it('Данные контакта не найдены.', function() {
                                                    tester.outCallSessionEvent().noName().receive();

                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-45-67 Исходящий звонок 00:00:00'
                                                    );
                                                });
                                                it(
                                                    'Отображен номер, таймер, направление и сообщение о поиске ' +
                                                    'контакта.',
                                                function() {
                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-45-67 Поиск контакта... 00:00:00'
                                                    );
                                                });
                                            });
                                            describe('Контакт является сотрудником.', function() {
                                                beforeEach(function() {
                                                    numaRequest.employeeNameIsFound().receiveResponse();
                                                });

                                                it(
                                                    'Нажимаю на кнопку остановки звонка. Ввожу тот же самый номер. ' +
                                                    'Отображается поле номера.',
                                                function() {
                                                    tester.stopCallButton.click();
                                                    tester.requestCancelOutgoingCall();

                                                    tester.phoneField.fill('79161234567');

                                                    tester.phoneField.expectToHaveValue('79161234567');
                                                });
                                                it('Отображено имя, номер и таймер.', function() {
                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                    );
                                                });
                                            });
                                        });
                                        it('Кнопка вызова заблокирована.', function() {
                                            tester.callButton.expectToHaveAttribute('disabled');
                                        });
                                    });
                                    describe('SIP-регистрация завершена.', function() {
                                        beforeEach(function() {
                                            registrationRequest.receiveResponse();
                                        });

                                        describe('Открываю историю звонков.', function() {
                                            let callsRequest;
                                            
                                            beforeEach(function() {
                                                tester.callsHistoryButton.click();
                                                callsRequest = tester.callsRequest();
                                            });

                                            describe('Звонок не является трансфером.', function() {
                                                beforeEach(function() {
                                                    callsRequest.receiveResponse();
                                                });

                                                describe('Прокручиваю историю.', function() {
                                                    beforeEach(function() {
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                    });

                                                    it(
                                                        'Прокручиваю историю до конца. Запрошена вторая страница ' +
                                                        'истории.',
                                                    function() {
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsRequest().secondPage().expectToBeSent();
                                                    });
                                                    it('Вторая страница истории еще не запрошена.', function() {
                                                        ajax.expectNoRequestsToBeSent();
                                                    });
                                                });
                                                describe('Соединение разрывается.', function() {
                                                    beforeEach(function() {
                                                        tester.disconnectEventsWebSocket();
                                                    });

                                                    describe('Нажимаю на кнопку закрытия сообщения.', function() {
                                                        beforeEach(function() {
                                                            tester.closeButton.click();
                                                        });

                                                        it(
                                                            'Соединение востановлено и снова разорвано. Отображено ' +
                                                            'сообщение о разрыве сети.',
                                                        function() {
                                                            spendTime(1001);
                                                            Promise.runAll(false, true);

                                                            tester.connectEventsWebSocket(1);
                                                            Promise.runAll(false, true);
                                                            tester.authenticatedUserRequest().receiveResponse();

                                                            tester.disconnectEventsWebSocket(1);

                                                            tester.softphone.
                                                                expectTextContentToHaveSubstring('Разрыв сети');
                                                        });
                                                        it('Сообщение скрыто.', function() {
                                                            tester.softphone.
                                                                expectTextContentNotToHaveSubstring('Разрыв сети');
                                                        });
                                                    });
                                                    it(
                                                        'Кнопка звонка заблокирована. Отображено сообщение о разрыве ' +
                                                        'сети.',
                                                    function() {
                                                        tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                            expectToHaveAttribute('disabled');

                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            'Разрыв сети'
                                                        );
                                                    });
                                                });
                                                it('Нажимаю на иконку звонка.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();
                                                    tester.allowMediaInput();

                                                    tester.numaRequest().anotherNumber().receiveResponse();
                                                    tester.outboundCall().setNumberFromCallsGrid().start().setRinging();

                                                    tester.callButton.expectToBeVisible();
                                                });
                                                it('Нажимаю на имя. Открыта страница контакта.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                                                    windowOpener.expectToHavePath(
                                                        'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                                    );
                                                });
                                                it('Отображены иконки направлений.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                        expectNotToHaveAttribute('disabled');

                                                    tester.callsHistoryRow.withText('Гяурова Марийка').directory.
                                                        expectToHaveClass('cmg-direction-incoming');

                                                    tester.callsHistoryRow.withText('Манова Тома').directory.
                                                        expectToHaveClass('cmg-direction-outgoing');
                                                });
                                            });
                                            it('Звонок является трансфером. Отображена иконка трансфера.', function() {
                                                callsRequest.transfer().receiveResponse();

                                                tester.callsHistoryRow.withText('Гяурова Марийка').directory.
                                                    expectToHaveClass('cmg-direction-transfer');
                                            });
                                            it(
                                                'Не было ни одного звонка. Отображено сообщение об отсутствии звонков.',
                                            function() {
                                                callsRequest.noCalls().receiveResponse();

                                                tester.softphone.expectToHaveTextContent(
                                                    'Совершите звонок для отображения истории'
                                                );
                                            });
                                        });
                                        describe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                            beforeEach(function() {
                                                tester.userName.putMouseOver();
                                                tester.logoutButton.click();

                                                tester.userLogoutRequest().receiveResponse();

                                                Promise.runAll(false, true);
                                                spendTime(0);
                                                Promise.runAll(false, true);
                                                spendTime(0);
                                                Promise.runAll(false, true);
                                                spendTime(0);

                                                tester.authLogoutRequest().receiveResponse();
                                                tester.eventsWebSocket.finishDisconnecting();
                                                tester.registrationRequest().expired().receiveResponse();

                                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                                tester.button('Войти').click();

                                                tester.loginRequest().anotherAuthorizationToken().receiveResponse();
                                                accountRequest = tester.accountRequest().anotherAuthorizationToken().
                                                    expectToBeSent();
                                            });

                                            it('Софтфон недоступен.', function() {
                                                accountRequest.softphoneUnavailable().receiveResponse();

                                                tester.reportGroupsRequest().anotherAuthorizationToken().
                                                    receiveResponse();
                                                tester.reportsListRequest().receiveResponse();
                                                tester.reportTypesRequest().receiveResponse();

                                                tester.softphone.expectNotToExist();
                                                tester.button('Софтфон').expectNotToExist();
                                            });
                                            it('Софтфон доступен. Отображен софтфон.', function() {
                                                accountRequest.receiveResponse();
                                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                                tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                                tester.configRequest().softphone().receiveResponse();

                                                tester.reportGroupsRequest().anotherAuthorizationToken().
                                                    receiveResponse();
                                                tester.reportsListRequest().receiveResponse();
                                                tester.reportTypesRequest().receiveResponse();

                                                tester.statusesRequest().createExpectation().
                                                    anotherAuthorizationToken().checkCompliance().receiveResponse();

                                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                                tester.talkOptionsRequest().receiveResponse();
                                                tester.permissionsRequest().receiveResponse();

                                                tester.connectEventsWebSocket(1);
                                                tester.connectSIPWebSocket(1);

                                                tester.authenticatedUserRequest().receiveResponse();
                                                tester.registrationRequest().receiveResponse();
                                                tester.allowMediaInput();

                                                tester.phoneField.fill('79161234567');

                                                tester.callButton.expectNotToHaveAttribute('disabled');
                                                tester.button('Софтфон').expectToBeVisible();
                                            });
                                        });
                                        describe('Нажимаю на кнопку аккаунта.', function() {
                                            beforeEach(function() {
                                                tester.userName.putMouseOver();
                                            });

                                            it('Выбираю другой статус. Другой статус выбран.', function() {
                                                tester.statusesList.item('Нет на месте').click();

                                                tester.userStateUpdateRequest().receiveResponse();
                                                tester.notificationOfUserStateChanging().anotherStatus().receive();

                                                tester.statusesList.item('Не беспокоить').expectNotToBeSelected();
                                                tester.statusesList.item('Нет на месте').expectToBeSelected();

                                                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
                                            });
                                            it('Отображен список статусов.', function() {
                                                tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                                tester.statusesList.item('Нет на месте').expectNotToBeSelected();

                                                tester.statusesList.expectTextContentToHaveSubstring(
                                                    'Доступен ' +
                                                    'Перерыв ' +
                                                    'Не беспокоить ' +
                                                    'Нет на месте ' +
                                                    'Нет на работе'
                                                );
                                            });
                                        });
                                        describe('Нажимаю на кнопку таблицы сотрудников.', function() {
                                            beforeEach(function() {
                                                tester.addressBookButton.click();

                                                tester.usersRequest().receiveResponse();
                                                tester.usersInGroupsRequest().receiveResponse();
                                                tester.groupsRequest().receiveResponse();
                                            });

                                            it('Соединение разрывается.', function() {
                                                tester.disconnectEventsWebSocket();
                                                tester.employeeRow('Шалева Дора').expectToBeDisaled();

                                                tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                                            });
                                            it('Отображена таблица сотрудников.', function() {
                                                tester.employeeRow('Божилова Йовка').callIcon.expectToBeVisible();
                                            });
                                        });
                                        it(
                                            'Соединение разрывается. Отображено сообщение об установке соединения.',
                                        function() {
                                            tester.disconnectEventsWebSocket();

                                            tester.softphone.expectToHaveTextContent(
                                                'Устанавливается соединение...'
                                            );
                                        });
                                        it(
                                            'Нажимаю на кнопку открытия диалпада. Кнопка удаления цифры видима.',
                                        function() {
                                            tester.dialpadButton.click();
                                            tester.digitRemovingButton.expectToBeVisible();
                                        });
                                        it(
                                            'Выпадающий список номеров скрыт. Кнопка удаления цифры скрыта.',
                                        function() {
                                            tester.select.expectNotToExist();

                                            tester.softphone.expectTextContentNotToHaveSubstring(
                                                'Микрофон не обнаружен'
                                            );

                                            tester.digitRemovingButton.expectNotToExist();
                                            tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
                                        });
                                    });
                                    it('Нажимаю на иконку с телефоном. Сотфтфон скрыт.', function() {
                                        tester.button('Софтфон').click();
                                        tester.callButton.expectNotToExist();
                                    });
                                });
                                it('Отображен пункт меню. Софтфон скрыт. Отображается статус сотрудника.', function() {
                                    tester.callButton.expectNotToExist();
                                    tester.body.expectTextContentToHaveSubstring('Дашборды');
                                });
                            });
                            describe('SIP-регистрация завершена. Срок действия токена авторизации истек.', function() {
                                let refreshRequest;

                                beforeEach(function() {
                                    registrationRequest.receiveResponse();

                                    reportGroupsRequest.accessTokenExpired().receiveResponse();
                                    refreshRequest = tester.refreshRequest().expectToBeSent();

                                    spendTime(0);
                                });

                                it(
                                    'Токен авторизации обновлен. Получены данные для отчета. Отображен пункт меню.',
                                function() {
                                    refreshRequest.receiveResponse();
                                    tester.reportGroupsRequest().anotherAuthorizationToken().receiveResponse();

                                    tester.body.expectTextContentToHaveSubstring('Дашборды');
                                });
                                it('Пункт меню не отображен.', function() {
                                    tester.body.expectTextContentNotToHaveSubstring('Дашборды');

                                    refreshRequest.receiveResponse();
                                    tester.reportGroupsRequest().anotherAuthorizationToken().expectToBeSent();
                                });
                            });
                        });
                        it(
                            'SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном. Отображено сообщение о ' +
                            'том, что SIP-линия не зарегистрирована.',
                        function() {
                            tester.button('Софтфон').click();
                            tester.phoneField.fill('79161234567');

                            authenticatedUserRequest.sipIsOffline().receiveResponse();
                            registrationRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();

                            tester.callButton.expectToHaveAttribute('disabled');

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Sip-линия не зарегистрирована'
                            );
                        });
                    });
                    describe('Доступ к микрофону отклонен. Нажимаю на иконку телефона.', function() {
                        beforeEach(function() {
                            tester.disallowMediaInput();

                            authenticatedUserRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();
                            registrationRequest.receiveResponse();

                            tester.button('Софтфон').click();
                        });

                        it('Нажимаю на кнопку закрытия сообщения. Сообщение скрыто.', function() {
                            tester.closeButton.click();
                            tester.softphone.expectTextContentNotToHaveSubstring('Микрофон не обнаружен');
                        });
                        it('Отображено сообщение об отсутствии доступа к микрофону.', function() {
                            tester.softphone.expectTextContentToHaveSubstring('Микрофон не обнаружен');
                        });
                    });
                });
                it(
                    'Сначала запрос от лк, а потом и запрос от софтфона завершился ошибкой истечения токена ' +
                    'авторизации. Отправлен только один запрос обновления токена.',
                function() {
                    reportGroupsRequest.accessTokenExpired().receiveResponse();
                    settingsRequest.accessTokenExpired().receiveResponse();

                    tester.refreshRequest().receiveResponse();

                    tester.settingsRequest().anotherAuthorizationToken().expectToBeSent();
                    tester.reportGroupsRequest().anotherAuthorizationToken().expectToBeSent();
                });
                it(
                    'Сначала запрос от софтфона, а потом и запрос от лк завершился ошибкой истечения токена ' +
                    'авторизации. Отправлен только один запрос обновления токена.',
                function() {
                    settingsRequest.accessTokenExpired().receiveResponse();
                    reportGroupsRequest.accessTokenExpired().receiveResponse();

                    tester.refreshRequest().receiveResponse();

                    tester.settingsRequest().anotherAuthorizationToken().expectToBeSent();
                    tester.reportGroupsRequest().anotherAuthorizationToken().expectToBeSent();
                });
                it(
                    'Срок действия токена авторизации истек. Токен авторизации обновлен. Софтфон подключен.',
                function() {
                    settingsRequest.accessTokenExpired().receiveResponse();
                    tester.refreshRequest().receiveResponse();
                    tester.settingsRequest().anotherAuthorizationToken().receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.connectSIPWebSocket();

                    tester.allowMediaInput();

                    tester.authenticatedUserRequest().anotherAuthorizationToken().receiveResponse();
                    tester.registrationRequest().receiveResponse();
                });
                it('Токен невалиден. Отображена форма аутентификации.', function() {
                    settingsRequest.accessTokenInvalid().receiveResponse();
                    tester.authLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                });
            });
            describe('Нажимаю на иконку с телефоном.', function() {
                beforeEach(function() {
                    reportGroupsRequest.receiveResponse();
                    tester.button('Софтфон').click();
                });

                describe('Пользователь имеет права на список номеров.', function() {
                    beforeEach(function() {
                        permissionsRequest = permissionsRequest.allowNumberCapacitySelect();
                        settingsRequest = settingsRequest.allowNumberCapacitySelect();
                    });

                    describe('У выбранного номера нет комментария.', function() {
                        beforeEach(function() {
                            settingsRequest.receiveResponse();
                        });

                        describe('Пользователь имеет права на выбор номера.', function() {
                            beforeEach(function() {
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.connectSIPWebSocket();

                                tester.allowMediaInput();

                                tester.numberCapacityRequest().receiveResponse();
                                tester.registrationRequest().receiveResponse();
                                tester.authenticatedUserRequest().receiveResponse();
                            });
                            
                            describe('Раскрываю список номеров.', function() {
                                beforeEach(function() {
                                    tester.select.arrow.click();
                                });

                                it(
                                    'Выбираю номер. Отправлен запрос смены номера. Отображен выбранный номер.',
                                function() {
                                    tester.select.option('+7 (916) 123-89-29').click();

                                    tester.saveNumberCapacityRequest().receiveResponse();

                                    tester.softphone.expectTextContentToHaveSubstring(
                                        '+7 (916) 123-89-29 ' +
                                        'Некий номер'
                                    );
                                });
                                it('Выбранный номер выделен.', function() {
                                    tester.select.option('+7 (916) 123-89-27').
                                        expectNotToHaveClass('ui-list-option-selected');

                                    tester.select.option('+7 (495) 021-68-06').
                                        expectToHaveClass('ui-list-option-selected');
                                });
                            });
                            it('Отображен выбранный номер телефона.', function() {
                                tester.select.expectToHaveTextContent('+7 (495) 021-68-06');

                            });
                        });
                        it('Безуспешно пытаюсь выбрать номер.', function() {
                            permissionsRequest.receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().receiveResponse();

                            tester.select.arrow.click();
                            tester.select.option('+7 (916) 123-89-29').expectNotToExist();
                        });
                    });
                    describe(
                        'У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.',
                    function() {
                        let authenticatedUserRequest;

                        beforeEach(function() {
                            settingsRequest.numberCapacityComment().receiveResponse();
                            permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.registrationRequest().receiveResponse();
                            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        });

                        it(
                            'SIP-линия не зарегистрирована. Отображено сообщение о том, что SIP-линия не ' +
                            'зарегистрирована.',
                        function() {
                            authenticatedUserRequest.sipIsOffline().receiveResponse();

                            tester.softphone.expectToHaveTextContent(
                                'Sip-линия не зарегистрирована ' +
                                'Выберите АОН из списка ' +

                                '+7 (495) 021-68-06 ' +
                                'Отдел консалтинга'
                            );
                        });
                        it('Отображен выбранный номер и комментарий.', function() {
                            authenticatedUserRequest.receiveResponse();

                            tester.softphone.expectToHaveTextContent(
                                '+7 (495) 021-68-06 ' +
                                'Отдел консалтинга'
                            );
                        });
                    });
                });
                describe('Пользователь не имеет права на список номеров.', function() {
                    beforeEach(function() {
                        permissionsRequest.receiveResponse();
                    });

                    describe('Включено управление звонками на другом устройстве.', function() {
                        beforeEach(function() {
                            settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();
                        });

                        it('Соединение установлено.', function() {
                            tester.connectEventsWebSocket();
                            tester.authenticatedUserRequest().sipIsOffline().receiveResponse();

                            tester.softphone.expectToHaveTextContent(
                                'Используется на другом устройстве ' +
                                'Включено управление звонками с другого устройства или программы'
                            );
                        });
                        it('Устанавливается соединение. Отображено сообщение об установке соединения.', function() {
                            tester.getEventsWebSocket().expectToBeConnecting();

                            tester.softphone.expectToHaveTextContent(
                                'Используется на другом устройстве ' +
                                'Устанавливается соединение...'
                            );
                        });
                    });
                    it('Необходимо подключиться к РТУ напрямую. Подключаюсь.', function() {
                        tester.setJsSIPRTUUrl();
                        settingsRequest.setRTU().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.requestRegistration().setRTU().receiveResponse();
                    });
                    it('Получена некорректная конфигурация прямого подключения к РТУ. Подключаюсь к каме.', function() {
                        settingsRequest.setInvalidRTUConfig().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.requestRegistration().receiveResponse();
                    });
                });
            });
        });
        describe('Чаты доступны. Софтфон недоступен.', function() {
            beforeEach(function() {
                accountRequest.operatorWorkplaceAvailable().softphoneUnavailable().receiveResponse();

                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                const requests = fetch.inAnyOrder();

                const configRequest1 = tester.configRequest().expectToBeSent(requests),
                    configRequest2 = tester.configRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                configRequest1.receiveResponse();
                configRequest2.receiveResponse();

                tester.operatorAccountRequest().receiveResponse();

                tester.chatChannelListRequest().receiveResponse();
                tester.operatorStatusListRequest().receiveResponse();
                tester.operatorListRequest().receiveResponse();
                tester.operatorSiteListRequest().receiveResponse();
                tester.operatorAccountRequest().receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.operatorOfflineMessageListRequest().receiveResponse();
                tester.chatListRequest().receiveResponse();
            });

            describe('Нажимаю на кнопку аккаунта.', function() {
                beforeEach(function() {
                    tester.userName.putMouseOver();
                });

                it('Выбираю другой статус. Другой статус выбран.', function() {
                    tester.statusesList.item('Перерыв').click();

                    tester.operatorStatusUpdateRequest().receiveResponse();
                    tester.chatsEmployeeChangeMessage().receive();

                    tester.statusesList.item('Доступен').expectNotToBeSelected();
                    tester.statusesList.item('Перерыв').expectToBeSelected();

                    tester.body.expectTextContentToHaveSubstring('karadimova Перерыв');
                });
                it('Отображен список статусов.', function() {
                    tester.statusesList.item('Доступен').expectToBeSelected();
                    tester.statusesList.item('Перерыв').expectNotToBeSelected();

                    tester.statusesList.expectTextContentToHaveSubstring(
                        'Доступен ' +
                        'Перерыв ' +
                        'Не беспокоить ' +
                        'Нет на месте ' +
                        'Нет на работе'
                    );
                });
            });
            it('Отображается статус сотрудника.', function() {
                tester.body.expectTextContentToHaveSubstring('karadimova Доступен');
            });
        });
        it('Софтфон недоступен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneUnavailable().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
        });
        it('Фичафлаг софтфона выключен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneFeatureFlagDisabled().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
        });
    });
    it('Я уже аутентифицирован. Открывый новый личный кабинет. Проверяется аутентификация в софтфоне.', function() {
        const tester = new Tester({
            ...options,
            isAlreadyAuthenticated: true
        });

        tester.accountRequest().receiveResponse();

        const requests = ajax.inAnyOrder();

        reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
        const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        secondAccountRequest.receiveResponse();

        tester.configRequest().softphone().receiveResponse();
        tester.authCheckRequest().expectToBeSent();
    });
});
