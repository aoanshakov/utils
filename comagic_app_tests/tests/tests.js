tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime
    } = options;

    describe('Открывый новый личный кабинет. Запрошены данные для отчета. Запрошены настройки софтфона.', function() {
        let tester,
            reportTableRequest,
            registrationRequest,
            settingsRequest;

        beforeEach(function() {
            tester = new Tester(options);

            tester.textField.withFieldLabel('Логин').fill('botusharova');
            tester.textField.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();
            Promise.runAll(false, true);

            tester.loginRequest().receiveResponse();
            tester.authCheckRequest().receiveResponse();

            tester.accountRequest().receiveResponse();

            tester.statusesRequest().receiveResponse();
            settingsRequest = tester.settingsRequest().expectToBeSent();

            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.configRequest().softphone().receiveResponse();
            tester.configRequest().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.operatorStatusListRequest().receiveResponse();
            tester.operatorListRequest().receiveResponse();
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

                describe('Нажимаю на иконку с телефоном. Ввожу номер телефона.', function() {
                    beforeEach(function() {
                        tester.phoneIcon.click();
                        tester.phoneField.input('79161234567');
                    });

                    it('SIP-регистрация завершена. Кнопка вызова доступна.', function() {
                        registrationRequest.receiveResponse();
                        tester.callButton.expectNotToHaveAttribute('disabled');
                    });
                    it('Нажимаю на иконку с телефоном. Кнопка вызова скрыта.', function() {
                        tester.phoneIcon.click();
                        tester.callButton.expectNotToExist();
                    });
                    it('Кнопка вызова заблокирована.', function() {
                        tester.callButton.expectToHaveAttribute('disabled');
                    });
                });
                it('SIP-регистрация завершена. Поступил входящий звонок.', function() {
                    registrationRequest.receiveResponse();

                    tester.incomingCall().receive();
                    Promise.runAll(false, true);
                    tester.numaRequest().receiveResponse();
                    tester.incomingCallProceeding().receive();

                    tester.innerContainer.expectTextContentToHaveSubstring('Шалева Дора');
                    tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                    tester.secondLineButton.expectNotToHaveClass('cmg-bottom-button-selected');
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
                'SIP-регистрация завершена. Нажимаю на иконку с телефоном. Ввожу номер телефона. Срок действия ' +
                'токена авторизации истек.',
            function() {
                var refreshRequest;

                beforeEach(function() {
                    registrationRequest.receiveResponse();

                    tester.phoneIcon.click();
                    tester.phoneField.input('79161234567');

                    reportTableRequest.accessTokenExpired().receiveResponse();
                    refreshRequest = tester.refreshRequest().expectToBeSent();

                    tester.eventsWebSocket.finishDisconnecting();
                });

                describe('Токен авторизации обновлен. Запрошены данные для отчета.', function() {
                    beforeEach(function() {
                        refreshRequest.receiveResponse();

                        reportTableRequest = tester.reportTableRequest().
                            thirdColumn().visitorRegion().anotherAuthoriationToken().expectToBeSent();
                    });

                    describe('Получены данные для отчета.', function() {
                        beforeEach(function() {
                            reportTableRequest.receiveResponse();
                        });

                        it('Прошло некоторое время. Кнопка вызова доступна.', function() {
                            spendTime(1000);

                            tester.anotherEventWebSocketPath();
                            tester.connectEventsWebSocket();
                            tester.authenticatedUserRequest().anotherAuthoriationToken().receiveResponse();

                            tester.callButton.expectNotToHaveAttribute('disabled');
                        });
                        it('Отображен отчет.', function() {
                            tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                                'Топ 10 регионов по количеству сделок',
                                'Некое значение'
                            );
                        });
                    });
                    it('Отчет не отображен.', function() {
                        tester.body.expectTextContentNotToHaveSubstringsConsideringOrder(
                            'Топ 10 регионов по количеству сделок',
                            'Некое значение'
                        );
                    });
                });
                describe('Проходит некоторое время.', function() {
                    beforeEach(function() {
                        spendTime(1000);
                    });

                    it('Токен авторизации обновлен. Кнопка вызова доступна.', function() {
                        refreshRequest.receiveResponse();

                        tester.reportTableRequest().
                            thirdColumn().visitorRegion().anotherAuthoriationToken().receiveResponse();

                        tester.anotherEventWebSocketPath();
                        tester.connectEventsWebSocket();
                        tester.authenticatedUserRequest().anotherAuthoriationToken().receiveResponse();

                        tester.callButton.expectNotToHaveAttribute('disabled');
                    });
                    it('Кнопка вызова заблокирована.', function() {
                        tester.callButton.expectToHaveAttribute('disabled');
                    });
                });
                it('Кнопка вызова заблокирована.', function() {
                    tester.callButton.expectToHaveAttribute('disabled');
                });
            });
        });
        it('Срок действия токена авторизации истек. Токен авторизации обновлен. Софтфон подключен.', function() {
            settingsRequest.accessTokenExpired().receiveResponse();
            tester.refreshRequest().receiveResponse();
            tester.settingsRequest().anotherAuthoriationToken().receiveResponse();

            tester.anotherEventWebSocketPath();
            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            tester.allowMediaInput();

            tester.authenticatedUserRequest().anotherAuthoriationToken().receiveResponse();
            tester.registrationRequest().receiveResponse();
        });
    });
});
