tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener,
        triggerMutation,
        ajax
    } = options;

    describe(
        'Открывый новый личный кабинет. Запрошены данные для отчета. Запрошены настройки софтфона. Запрошены права.',
    function() {
        let tester,
            reportTableRequest,
            settingsRequest,
            permissionsRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();
            Promise.runAll(false, true);

            tester.loginRequest().receiveResponse();
            tester.authCheckRequest().receiveResponse();
            tester.accountRequest().receiveResponse();

            tester.configRequest().softphone().receiveResponse();
            tester.configRequest().receiveResponse();

            tester.statusesRequest().receiveResponse();
            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.operatorAccountRequest().receiveResponse();

            tester.reportStateRequest().receiveResponse();
            tester.reportRapidFiltersRequest().receiveResponse();
            tester.reportTotalRequest().receiveResponse();

            tester.communicationsRequest().receiveResponse();
            tester.communicationsRequest().anotherDate().receiveResponse();

            tester.reportTotalRequest().anotherColumn().receiveResponse();
            tester.reportTotalRequest().anotherColumn().anotherDate().receiveResponse();
            tester.reportTotalRequest().thirdColumn().receiveResponse();
            tester.reportTotalRequest().thirdColumn().anotherDate().receiveResponse();
            tester.reportTotalRequest().fourthColumn().receiveResponse();
            tester.reportTotalRequest().fourthColumn().anotherDate().receiveResponse();
            tester.reportTotalRequest().fifthColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().sixthColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().seventhColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().eighthColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().ninthColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().tenthColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().eleventhColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().twelvethColumn().adAnalytics().receiveResponse();
            tester.reportTotalRequest().thirtinthColumn().adAnalytics().receiveResponse();
            tester.reportTableRequest().receiveResponse();
            tester.reportTableRequest().anotherColumn().receiveResponse();
            tester.reportTableRequest().thirdColumn().receiveResponse();
            reportTableRequest = tester.reportTableRequest().thirdColumn().visitorRegion().expectToBeSent();
        });

        afterEach(function() {
            spendTime(0);
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
                                reportTableRequest.receiveResponse();
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
                                                usersInGroupsRequest = tester.usersInGroupsRequest().expectToBeSent();
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
                                                        'Ввожу значение в поле поиска. Ничего не найдено. Отображено ' +
                                                        'сообщение о том, что ничего не найдено.',
                                                    function() {
                                                        tester.softphone.input.fill('йцукен');
                                                        tester.softphone.expectToHaveTextContent('Сотрудник не найден');
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

                                        windowOpener.
                                            expectToHavePath('https://comagicwidgets.amocrm.ru/contacts/detail/382030');
                                    });
                                    it('Отображена информация о контакте.', function() {
                                        tester.contactOpeningButton.expectNotToHaveClass('cmg-button-disabled');
                                        tester.incomingIcon.expectToBeVisible();
                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Шалева Дора +7 (916) 123-45-67'
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

                                    it('Имя контакта отсутствует. Звонок обозначен, как исходящий обзвон.', function() {
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

                                    tester.anchor('По звонку с 79154394340').
                                        expectHrefToHavePath('https://comagicwidgets.amocrm.ru/leads/detail/3003651');
                                });
                                it('У контакта длинное имя.', function() {
                                    tester.outCallEvent().longName().receive();
                                });
                                it('Отображено сообщение о поиске контакта.', function() {
                                    tester.contactOpeningButton.expectNotToExist();
                                    tester.incomingIcon.expectToBeVisible();
                                    tester.softphone.expectTextContentToHaveSubstring(
                                        '+7 (916) 123-45-67 Поиск контакта...'
                                    );
                                });
                            });
                            describe('Нажимаю на иконку с телефоном.', function() {
                                beforeEach(function() {
                                    tester.phoneIcon.click();
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
                                            it('Данные контакта не найдены.', function() {
                                                tester.outCallSessionEvent().noName().receive();

                                                tester.outgoingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-45-67 Исходящий звонок 00:00:00'
                                                );
                                            });
                                            it(
                                                'Отображен номер, таймер, направление и сообщение о поиске контакта.',
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
                                                    'Прокручиваю историю до конца. Запрошена вторая страница истории.',
                                                function() {
                                                    tester.callsGridScrolling().toTheEnd().scroll();
                                                    tester.callsRequest().secondPage().expectToBeSent();
                                                });
                                                it('Вторая страница истории еще не запрошена.', function() {
                                                    ajax.expectNoRequestsToBeSent();
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
                                            it('Соединение разрывается. Кнопка звонка заблокирована.', function() {
                                                tester.disconnectEventsWebSocket();

                                                tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                    expectToHaveAttribute('disabled');
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
                                    it('Выпадающий список номеров скрыт.', function() {
                                        tester.select.expectNotToExist();
                                        tester.softphone.expectTextContentNotToHaveSubstring('Микрофон не обнаружен');
                                    });
                                });
                                it('Нажимаю на иконку с телефоном. Сотфтфон скрыт.', function() {
                                    tester.phoneIcon.click();
                                    tester.callButton.expectNotToExist();
                                });
                            });
                            it('Отображен отчет. Софтфон скрыт.', function() {
                                tester.callButton.expectNotToExist();

                                tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                                    'Топ 10 регионов по количеству сделок',
                                    'Некое значение'
                                );
                            });
                        });
                        describe('SIP-регистрация завершена. Срок действия токена авторизации истек.', function() {
                            let refreshRequest;

                            beforeEach(function() {
                                registrationRequest.receiveResponse();

                                reportTableRequest.accessTokenExpired().receiveResponse();
                                refreshRequest = tester.refreshRequest().expectToBeSent();

                                spendTime(0);
                            });

                            it('Токен авторизации обновлен. Получены данные для отчета. Отображен отчет.', function() {
                                refreshRequest.receiveResponse();

                                tester.reportTableRequest().thirdColumn().visitorRegion().anotherAuthoriationToken().
                                    receiveResponse();

                                tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                                    'Топ 10 регионов по количеству сделок',
                                    'Некое значение'
                                );
                            });
                            it('Отчет не отображен.', function() {
                                tester.body.expectTextContentNotToHaveSubstringsConsideringOrder(
                                    'Топ 10 регионов по количеству сделок',
                                    'Некое значение'
                                );

                                refreshRequest.receiveResponse();
                                tester.reportTableRequest().thirdColumn().visitorRegion().anotherAuthoriationToken().
                                    expectToBeSent();
                            });
                        });
                    });
                    it(
                        'SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном. Отображено сообщение о том, ' +
                        'что SIP-линия не зарегистрирована.',
                    function() {
                        tester.phoneIcon.click();
                        tester.phoneField.fill('79161234567');

                        authenticatedUserRequest.sipIsOffline().receiveResponse();
                        registrationRequest.receiveResponse();
                        reportTableRequest.receiveResponse();

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
                        reportTableRequest.receiveResponse();
                        registrationRequest.receiveResponse();

                        tester.phoneIcon.click();
                    });

                    it('Нажимаю на кнопку закрытия сообщения. Сообщение скрыто.', function() {
                        tester.microphoneUnavailabilityMessageCloseButton.click();
                        tester.softphone.expectTextContentNotToHaveSubstring('Микрофон не обнаружен');
                    });
                    it('Отображено сообщение об отсутствии доступа к микрофону.', function() {
                        tester.softphone.expectTextContentToHaveSubstring('Микрофон не обнаружен');
                    });
                });
            });
            it(
                'Сначала запрос от лк, а потом и запрос от софтфона завершился ошибкой истечения токена авторизации. ' +
                'Отправлен только один запрос обновления токена.',
            function() {
                reportTableRequest.accessTokenExpired().receiveResponse();
                settingsRequest.accessTokenExpired().receiveResponse();

                tester.refreshRequest().receiveResponse();

                tester.settingsRequest().anotherAuthoriationToken().expectToBeSent();
                tester.reportTableRequest().thirdColumn().visitorRegion().anotherAuthoriationToken().expectToBeSent();
            });
            it(
                'Сначала запрос от софтфона, а потом и запрос от лк завершился ошибкой истечения токена авторизации. ' +
                'Отправлен только один запрос обновления токена.',
            function() {
                settingsRequest.accessTokenExpired().receiveResponse();
                reportTableRequest.accessTokenExpired().receiveResponse();

                tester.refreshRequest().receiveResponse();

                tester.settingsRequest().anotherAuthoriationToken().expectToBeSent();
                tester.reportTableRequest().thirdColumn().visitorRegion().anotherAuthoriationToken().expectToBeSent();
            });
            it('Срок действия токена авторизации истек. Токен авторизации обновлен. Софтфон подключен.', function() {
                settingsRequest.accessTokenExpired().receiveResponse();
                tester.refreshRequest().receiveResponse();
                tester.settingsRequest().anotherAuthoriationToken().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().anotherAuthoriationToken().receiveResponse();
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
                reportTableRequest.receiveResponse();
                tester.phoneIcon.click();
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

                            it('Выбираю номер. Отправлен запрос смены номера. Отображен выбранный номер.', function() {
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
                describe('У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.', function() {
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
            describe('Включено управление звонками на другом устройстве.', function() {
                beforeEach(function() {
                    permissionsRequest.receiveResponse();
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
        });
    });
    it('Я уже аутентифицирован. Открывый новый личный кабинет. Проверяется аутентификация в софтфоне.', function() {
        const tester = new Tester({
            ...options,
            isAlreadyAuthenticated: true
        });

        tester.authCheckRequest().expectToBeSent();
        tester.accountRequest().expectToBeSent();

        tester.configRequest().softphone().expectToBeSent();
    });
});
