tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener
    } = options;

    describe(
        'Открывый новый личный кабинет. Запрошены данные для отчета. Запрошены настройки софтфона. Запрошены права.',
    function() {
        let tester,
            reportTableRequest,
            registrationRequest,
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
                beforeEach(function() {
                    settingsRequest.receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.connectSIPWebSocket();

                    tester.allowMediaInput();

                    tester.authenticatedUserRequest().receiveResponse();
                    registrationRequest = tester.registrationRequest().expectToBeSent();
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
                                    beforeEach(function() {
                                        tester.transferButton.click();

                                        tester.usersRequest().receiveResponse();
                                        tester.usersInGroupsRequest().receiveResponse();
                                        tester.groupsRequest().receiveResponse();
                                    });

                                    describe(
                                        'Нажимаю на кнопку поиска. Ввожу значение в поле поиска.',
                                    function() {
                                        beforeEach(function() {
                                            tester.searchButton.click();
                                            tester.softphone.input.fill('ова');
                                        });

                                        it('Нажимаю на иконку очищения поля. Отображены все сотрудники.', function() {
                                            tester.softphone.input.clearIcon.click();

                                            tester.softphone.expectToHaveTextContent(
                                                'Employees Groups ' +

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
                                    it('Открываю вкладку групп.', function() {
                                        tester.button('Groups').click();

                                        tester.softphone.expectToHaveTextContent(
                                            'Employees Groups ' +

                                            'Отдел дистрибуции 298 1 /1 ' +
                                            'Отдел по работе с ключевыми клиентами 726 0 /1 ' +
                                            'Отдел региональных продаж 828 2 /2'
                                        );
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
                                            'Employees Groups ' +

                                            'ЙБ Божилова Йовка 296 ' +
                                            'НГ Господинова Николина 295 ' +
                                            'Шалева Дора 8258'
                                        );

                                        tester.employeeRow('Божилова Йовка').transferIcon.expectToBeVisible();
                                        tester.employeeRow('Божилова Йовка').expectToBeDisaled();
                                        tester.employeeRow('Шалева Дора').expectNotToBeDisaled();
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
                                    'Шалева Дора +7 (916) 123-45-67 Transferred by Бисерка Макавеева'
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
                                    '+7 (916) 123-45-67 Outgoing auto-call'
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
                            'Контакт не найден. Отображно направление звонка. Кнопка открытия контакта заблокирована.',
                        function() {
                            tester.outCallEvent().noName().noCrmContactLink().receive();
                            tester.contactOpeningButton.click();

                            tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                            windowOpener.expectNoWindowToBeOpened();

                            tester.incomingIcon.expectToBeVisible();
                            tester.softphone.expectTextContentToHaveSubstring(
                                '+7 (916) 123-45-67 Incoming call'
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
                                '+7 (916) 123-45-67 Searching for contact...'
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
                                let outboundCall;

                                beforeEach(function() {
                                    registrationRequest.receiveResponse();

                                    tester.callButton.click();
                                    
                                    tester.firstConnection.connectWebRTC();
                                    tester.allowMediaInput();

                                    tester.numaRequest().receiveResponse();

                                    outboundCall = tester.outboundCall().start().setRinging();
                                    tester.firstConnection.callTrackHandler();
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
                                        '+7 (916) 123-45-67 Outgoing call 00:00:00'
                                    );
                                });
                                it(
                                    'Отображен номер, таймер, направление и сообщение о поиске контакта.',
                                function() {
                                    tester.outgoingIcon.expectToBeVisible();
                                    tester.softphone.expectTextContentToHaveSubstring(
                                        '+7 (916) 123-45-67 Searching for contact... 00:00:00'
                                    );
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
                                        windowOpener.
                                            expectToHavePath('https://comagicwidgets.amocrm.ru/contacts/detail/218401');
                                    });
                                    it('Отображены иконки направлений.', function() {
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
                                it('Не было ни одного звонка. Отображено сообщение об отсутствии звонков.', function() {
                                    callsRequest.noCalls().receiveResponse();
                                    tester.softphone.expectToHaveTextContent('Make call to display history');
                                });
                            });
                            it('Нажимаю на кнопку таблицы сотрудников.', function() {
                                tester.addressBookButton.click();

                                tester.usersRequest().receiveResponse();
                                tester.usersInGroupsRequest().receiveResponse();
                                tester.groupsRequest().receiveResponse();

                                tester.employeeRow('Божилова Йовка').callIcon.expectToBeVisible();
                            });
                            it('Выпадающий список номеров скрыт.', function() {
                                tester.select.expectNotToExist();
                            });
                        });
                        it('Нажимаю на иконку с телефоном. Кнопка вызова скрыта.', function() {
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
                describe(
                    'SIP-регистрация завершена. Срок действия токена авторизации истек.',
                function() {
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
            it('Токен невалиден.', function() {
                settingsRequest.accessTokenInvalid().receiveResponse();
                tester.authLogoutRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').expectToBeVisible();
            });
        });
        describe('Нажимаю на иконку с телефоном. Пользователь имеет права на список номеров.', function() {
            beforeEach(function() {
                tester.phoneIcon.click();
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
                        tester.authenticatedUserRequest().receiveResponse();
                        tester.registrationRequest().receiveResponse();
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
                            tester.select.option('+7 (916) 123-89-27').expectNotToHaveClass('ui-list-option-selected');
                            tester.select.option('+7 (495) 021-68-06').expectToHaveClass('ui-list-option-selected');
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
            it('У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.', function() {
                settingsRequest.numberCapacityComment().receiveResponse();
                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().receiveResponse();

                tester.softphone.expectTextContentToHaveSubstring(
                    '+7 (495) 021-68-06 ' +
                    'Отдел консалтинга'
                );
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
