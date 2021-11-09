tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime
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
            tester = new Tester(options);

            tester.textField.withFieldLabel('Логин').fill('botusharova');
            tester.textField.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

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

        xdescribe('Получены права.', function() {
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

                    describe('Нажимаю на иконку с телефоном. Ввожу номер телефона.', function() {
                        beforeEach(function() {
                            tester.phoneIcon.click();
                            tester.phoneField.fill('79161234567');
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
                    it(
                        'SIP-регистрация завершена. Поступил входящий звонок. Отображена информация о звонке.',
                    function() {
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

                tester.textField.withFieldLabel('Логин').expectToBeVisible();
            });
        });
        describe('Нажимаю на иконку с микрофоном. Пользователь имеет права на список номеров.', function() {
            beforeEach(function() {
                tester.phoneIcon.click();
                permissionsRequest = permissionsRequest.allowNumberCapacitySelect();
            });

            describe('Пользователь имеет права на выбор номера.', function() {
                beforeEach(function() {
                    permissionsRequest.allowNumberCapacityUpdate().receiveResponse();
                    settingsRequest.allowNumberCapacitySelect().receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.connectSIPWebSocket();

                    tester.allowMediaInput();

                    tester.numberCapacityRequest().receiveResponse();
                    tester.authenticatedUserRequest().receiveResponse();
                    tester.registrationRequest().receiveResponse();
                });

                xdescribe('Раскрываю список номеров.', function() {
                    beforeEach(function() {
                        tester.select.arrow.click();
                    });

                    it('Выбираю номер. Отправлен запрос смены номера.', function() {
                        tester.select.option('+7 (916) 123-89-29').click();
                        tester.saveNumberCapacityRequest().receiveResponse();
                    });
                    it('Выбранный номе выделен.', function() {
                        tester.select.option('+7 (916) 123-89-27').expectNotToHaveClass('ui-list-option-selected');
                        tester.select.option('+7 (495) 021-68-06').expectToHaveClass('ui-list-option-selected');
                    });
                });
                return;
                it('Отображен выбранный номер телефона.', function() {
                    tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                });
            });
            return;
            it('Безуспешно пытаюсь выбрать номер.', function() {
                permissionsRequest.receiveResponse();
                settingsRequest.allowNumberCapacitySelect().receiveResponse();

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
    });
    return;
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
