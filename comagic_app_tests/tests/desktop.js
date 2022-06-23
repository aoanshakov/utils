tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener,
        mediaStreamsTester,
        unload,
        ajax,
        fetch,
        soundSources,
        setNow,
        fileReader,
        userMedia,
        audioDecodingTester,
        blobsTester,
        windowSize,
        notificationTester,
        setDocumentVisible
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю десктопное приложение софтфона.', function() {
        let tester;

        describe('Софтфон не должен отображаться поверх окон при входящем.', function() {
            let authenticatedUserRequest,
                accountRequest;

            beforeEach(function() {
                setNow('2019-12-19T12:10:06');
                localStorage.setItem('clct:to_top_on_call', 'false');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');

                accountRequest = tester.accountRequest().expectToBeSent();
            });

            describe('Софтфон доступен.', function() {
                let authCheckRequest;

                beforeEach(function() {
                    accountRequest.receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('feature-flags-fetched').
                        expectToBeSentWithArguments(['softphone', undefined]);

                    authCheckRequest = tester.authCheckRequest().expectToBeSent();
                });

                describe('Софтфон авторизован.', function() {
                    beforeEach(function() {
                        authCheckRequest.receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                        notificationTester.grantPermission();
                        tester.talkOptionsRequest().receiveResponse();

                        tester.permissionsRequest().allowNumberCapacitySelect().allowNumberCapacityUpdate().
                            receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.numberCapacityRequest().receiveResponse();
                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        tester.registrationRequest().desktopSoftphone().receiveResponse();
                    });

                    describe('SIP-линия зарегистрирована.', function() {
                        beforeEach(function() {
                            authenticatedUserRequest.receiveResponse();
                        });

                        describe('Нажимаю на кнопку настроек.', function() {
                            beforeEach(function() {
                                tester.settingsButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });
                            });
                            
                            describe('Софтфон должен запускаться автоматически.', function() {
                                beforeEach(function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('checkautolauncher', {
                                        isStartApp: true
                                    });
                                });

                                it(
                                    'Отмечаю переключатель "Запускать свернуто". Отправлено событие о необходимости ' +
                                    'запускать софтфон свернуто.',
                                function() {
                                    tester.button('Запускать свернуто').click();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('startminimizechange').
                                        expectToBeSentWithArguments(true);

                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();
                                    tester.button('Запускать свернуто').expectToBeChecked();
                                });
                                it('Приложение должно запускаться свернутым.', function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('checkstartminimize', {
                                        isStartMinimize: true
                                    });

                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();
                                    tester.button('Запускать свернуто').expectToBeChecked();
                                });
                                it('Форма настроек корректно заполнена.', function() {
                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();

                                    tester.button('Запускать свернуто').expectToBeEnabled();
                                    tester.button('Запускать свернуто').expectNotToBeChecked();
                                });
                            });
                            it(
                                'Отмечаю свитчбокс "Автозапуск приложения". Отправлено сообщение о ' +
                                'необходимости запускать приложение автоматически.',
                            function() {
                                tester.button('Автозапуск приложения').click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('autolauncherchange').
                                    expectToBeSentWithArguments(true);

                                tester.button('Открывать во время звонка').expectNotToBeChecked();
                                tester.button('Автозапуск приложения').expectToBeChecked();
                                tester.button('Запускать свернуто').expectNotToBeChecked();
                            });
                            it(
                                'Отмечаю свитчбокс "Открывать во время звонка". Значение параметра сохранено.',
                            function() {
                                tester.button('Открывать во время звонка').click();

                                tester.button('Открывать во время звонка').expectToBeChecked();
                                tester.button('Автозапуск приложения').expectNotToBeChecked();
                                tester.button('Запускать свернуто').expectNotToBeChecked();

                                if (localStorage.getItem('clct:to_top_on_call') !== 'true') {
                                    throw new Error(
                                        'Значение параметра "Открывать во время звонка" должно быть сохранено.'
                                    );
                                }
                            });
                            it('Нажимаю на кнопку "Смена статуса". Нажима на кнопку "Автоматически".', function() {
                                tester.button('Автоматически').click();
                                tester.settingsUpdatingRequest().autoSetStatus().receiveResponse();
                                tester.settingsRequest().autoSetStatus().receiveResponse();

                                tester.fieldRow('При входе').select.arrow.click();
                                tester.select.option('Перерыв').click();
                                tester.settingsUpdatingRequest().pauseOnLogin().receiveResponse();
                                tester.settingsRequest().autoSetStatus().pauseOnLogin().receiveResponse();

                                tester.fieldRow('При выходе').select.arrow.click();
                                tester.select.option('Не беспокоить').click();
                                tester.settingsUpdatingRequest().dontDisturbOnLogout().receiveResponse();
                                tester.settingsRequest().autoSetStatus().pauseOnLogin().dontDisturbOnLogout().
                                    receiveResponse();
                            });
                            it(
                                'Нажимаю на кнопку "Общие настройки". Нажимаю на кнопку "Софтфон или IP-телефон". ' +
                                'Отмечена кнопка "IP-телефон".',
                            function() {
                                tester.button('IP-телефон').click();
                                tester.settingsUpdatingRequest().callsAreManagedByAnotherDevice().receiveResponse();
                                tester.settingsRequest().callsAreManagedByAnotherDevice().receiveResponse();

                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();
                                
                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.button('Текущее устройство').expectNotToBeChecked();
                                tester.button('IP-телефон').expectToBeChecked();
                            });
                            it(
                                'Прошло некоторое время. Сервер событий не отвечает. Отображено сообщение об ' +
                                'установке соединения.',
                            function() {
                                spendTime(5000);
                                tester.expectPingToBeSent();
                                spendTime(2000);

                                tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                            });
                            it('Открываю вкладку "Звук". Отображены настройки звука.', function() {
                                tester.button('Звук').click();
                                tester.body.expectTextContentToHaveSubstring('Громкость звонка 100%');
                            });
                            it('Форма настроек заполнена правильно.', function() {
                                tester.button('Текущее устройство').expectToBeChecked();
                                tester.button('IP-телефон').expectNotToBeChecked();

                                tester.button('Открывать во время звонка').expectNotToBeChecked();
                                tester.button('Скрывать после звонка').expectToBeChecked();
                                tester.button('Автозапуск приложения').expectNotToBeChecked();

                                tester.button('Запускать свернуто').expectNotToBeChecked();
                                tester.button('Запускать свернуто').expectToBeDisabled();
                            });
                        });
                        describe('Раскрываю список статусов.', function() {
                            beforeEach(function() {
                                tester.userName.click();
                            });

                            it('Нажимаю на кнопку "Выход". Вхожу в софтфон заново. Удалось войти.', function() {
                                tester.statusesList.item('Выход').click();

                                tester.userLogoutRequest().receiveResponse();
                                
                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 300,
                                        height: 350
                                    });

                                tester.eventsWebSocket.finishDisconnecting();
                                tester.authLogoutRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();

                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                tester.button('Войти').click();

                                tester.loginRequest().anotherAuthorizationToken().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.configRequest().softphone().receiveResponse();

                                tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                tester.statusesRequest().createExpectation().
                                    anotherAuthorizationToken().checkCompliance().receiveResponse();
                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();

                                tester.connectEventsWebSocket(1);
                                tester.connectSIPWebSocket(1);

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().receiveResponse();

                                tester.allowMediaInput();
                            });
                            it('Выбираю статус. Список статусов скрыт.', function() {
                                tester.statusesList.item('Нет на месте').click();
                                tester.userStateUpdateRequest().receiveResponse();

                                tester.statusesList.expectNotToExist();
                            });
                            it('Отображены статусы.', function() {
                                tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                tester.body.expectTextContentNotToHaveSubstring('karadimova Не беспокоить');
                            });
                        });
                        describe('Поступает входящий звонок от пользователя имеющего открытые сделки.', function() {
                            let incomingCall;

                            beforeEach(function() {
                                incomingCall = tester.incomingCall().receive();
                                tester.numaRequest().receiveResponse();
                                tester.outCallEvent().activeLeads().receive();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('incoming-call').
                                    expectToBeSentWithArguments(false);
                            });

                            it(
                                'Нажимаю на цифру. Звонок принят. Нажимаю на решетку. Отправляется DTMF. Звучит тон.',
                            function() {
                                utils.pressEnter();

                                tester.firstConnection.connectWebRTC();
                                tester.firstConnection.callTrackHandler();

                                tester.allowMediaInput();
                                tester.firstConnection.addCandidate();
                                
                                incomingCall.expectOkToBeSent().receiveResponse();

                                utils.pressKey('7');
                                tester.dtmf('7').send();

                                tester.expectToneSevenToPlay();
                            });
                            it('Нажимаю на клавишу Esc. Звонок отклоняется.', function() {
                                utils.pressEscape();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('call-end').
                                    expectToBeSentWithArguments(true);

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                incomingCall.expectTemporarilyUnavailableToBeSent();
                            });
                            it('Нажимаю на открытую сделку. Открывается страница сделки.', function() {
                                tester.anchor('По звонку с 79154394340').click();

                                getPackage('electron').shell.expectExternalUrlToBeOpened(
                                    'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                );
                            });
                        });
                        describe('Нажимаю на кнопку дебага.', function() {
                            beforeEach(function() {
                                tester.bugButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('collect_logs');
                            });

                            it('Логи собраны. Загружается архив с логами. Спиннер скрыт.', function() {
                                tester.disableTimeout(() => getPackage('electron').ipcRenderer.receiveMessage(
                                    'logs_collected',
                                    new JsTester_ZipArchive()
                                ));

                                blobsTester.getLast().
                                    expectToHaveType('application/zip').
                                    expectToBeCreatedFromArray(new JsTester_ZipArchive());

                                tester.spinner.expectNotToExist();
                            });
                            it('Отображен спиннер.', function() {
                                tester.spinner.expectToBeVisible();
                            });
                        });
                        describe('Открываю таблицу сотрудников. Токен истек.', function() {
                            let refreshRequest;

                            beforeEach(function() {
                                tester.addressBookButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                tester.usersRequest().receiveResponse();
                                tester.usersInGroupsRequest().expectToBeSent();
                                tester.groupsRequest().accessTokenExpired().receiveResponse();

                                refreshRequest = tester.refreshRequest().expectToBeSent()
                            });

                            it(
                                'Не удалось обновить токен. Авторизуюсь заново. Пытаюсь поменять статус, но токен ' +
                                'истек.',
                            function() {
                                refreshRequest.refreshTokenExpired().receiveResponse();
                                tester.userLogoutRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 300,
                                        height: 350
                                    });

                                tester.authLogoutRequest().receiveResponse();
                                tester.eventsWebSocket.finishDisconnecting();
                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();

                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                tester.button('Войти').click();

                                tester.loginRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.configRequest().softphone().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                tester.authCheckRequest().receiveResponse();

                                tester.usersRequest().receiveResponse(),
                                tester.usersInGroupsRequest().receiveResponse(),
                                tester.groupsRequest().receiveResponse();

                                tester.accountRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                tester.statusesRequest().receiveResponse();
                                    
                                tester.settingsRequest().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();

                                tester.connectEventsWebSocket(1);
                                tester.connectSIPWebSocket(1);

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().receiveResponse();

                                tester.allowMediaInput();

                                tester.userName.click();

                                tester.statusesList.item('Нет на месте').click();
                                tester.userStateUpdateRequest().accessTokenExpired().receiveResponse();

                                tester.refreshRequest().receiveResponse();
                                tester.userStateUpdateRequest().receiveResponse();
                            });
                            it('Токен обновлен. Запросы переотправлены.', function() {
                                refreshRequest.receiveResponse();

                                tester.groupsRequest().receiveResponse();

                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                        });
                        describe('Открываю список номеров.', function() {
                            beforeEach(function() {
                                windowSize.setHeight(212);
                                tester.select.arrow.click();
                            });

                            it('Нажимаю на кнопку сворачивания списка.', function() {
                                tester.button('Отменить').click();
                                tester.select.popup.expectNotToExist();
                            });
                            it('Растягиваю окно. Список меняет положение и размер.', function() {
                                windowSize.setHeight(568);

                                tester.select.popup.expectToHaveTopOffset(92);
                                tester.select.popup.expectToHaveHeight(331);

                                tester.button('Отменить').expectNotToExist();
                            });
                            it(
                                'Закрываю список. Растягиваю окно. Открываю список. Список меняет положение и размер.',
                            function() {
                                tester.select.arrow.click();
                                windowSize.setHeight(568);
                                tester.select.arrow.click();

                                tester.select.popup.expectToHaveTopOffset(92);
                                tester.select.popup.expectToHaveHeight(331);

                                tester.button('Отменить').expectNotToExist();
                            });
                            it('Список вписан в окно.', function() {
                                tester.select.popup.expectToHaveTopOffset(4);
                                tester.select.popup.expectToHaveHeight(204);
                            });
                        });
                        describe('Получено обновление.', function() {
                            beforeEach(function() {
                                getPackage('electron').ipcRenderer.receiveMessage('update-downloaded');
                            });

                            it('Нажимаю на кнопку "Обновить".', function() {
                                tester.button('Обновить').click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('quit-and-install');
                            });
                            it('Отображено сообщение о получении обновления.', function() {
                                tester.body.expectTextContentToHaveSubstring('Получено обновление');
                            });
                        });
                        it(
                            'Софтфон открыт в другом окне. Раскрываю список статусов. Нажимаю на кнопку "Выход". ' +
                            'Вхожу в софтфон заново. Удалось войти. Софтфон готов к работе.',
                        function() {
                            tester.eventsWebSocket.disconnect(4429);
                            tester.authLogoutRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().expired().receiveResponse();
                            
                            spendTime(2000);
                            tester.webrtcWebsocket.finishDisconnecting();

                            tester.userName.click();
                            tester.statusesList.item('Выход').click();

                            tester.userLogoutRequest().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 300,
                                    height: 350
                                });

                            tester.input.withFieldLabel('Логин').fill('botusharova');
                            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                            tester.button('Войти').click();

                            tester.loginRequest().anotherAuthorizationToken().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('feature-flags-fetched').
                                expectToBeSentWithArguments(['softphone', undefined]);

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 212
                                });

                            tester.configRequest().softphone().receiveResponse();

                            tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                            tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('feature-flags-fetched').
                                expectToBeSentWithArguments(['softphone', undefined]);

                            tester.statusesRequest().createExpectation().
                                anotherAuthorizationToken().checkCompliance().receiveResponse();
                            tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();
                            tester.permissionsRequest().receiveResponse();

                            tester.connectEventsWebSocket(1);
                            tester.connectSIPWebSocket(1);

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().receiveResponse();

                            tester.allowMediaInput();

                            tester.phoneField.fill('79161234567');
                            tester.callStartingButton.expectNotToHaveAttribute('disabled');
                            tester.select.expectNotToExist();
                        });
                        it(
                            'Ввожу номер телефона. Нажимаю на кнпоку вызова. Поступил входящий звонок. Отображено ' +
                            'сообщение о звонке.',
                        function() {
                            tester.phoneField.fill('79161234567');
                            tester.callStartingButton.click();

                            tester.firstConnection.connectWebRTC();
                            tester.allowMediaInput();

                            tester.outboundCall().start().setRinging().setAccepted();
                            tester.firstConnection.callTrackHandler();

                            tester.numaRequest().receiveResponse();
                            tester.outCallSessionEvent().receive();

                            tester.incomingCall().thirdNumber().receive();
                            tester.numaRequest().thirdNumber().receiveResponse();
                            tester.outCallEvent().anotherPerson().receive();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('incoming-call').
                                expectToBeSentWithArguments(false);

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Гигова Петранка Входящий...'
                            );
                        });
                        it('Открываю историю звонков. Открывается страница контакта.', function() {
                            tester.callsHistoryButton.click();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 568
                                });

                            tester.callsRequest().receiveResponse();
                            tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                            getPackage('electron').shell.
                                expectExternalUrlToBeOpened('https://comagicwidgets.amocrm.ru/contacts/detail/218401');
                        });
                        it('Нажимаю на кнопку диалпада. Раскрываю список статусов. Отображены статусы.', function() {
                            tester.dialpadVisibilityButton.click();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 568
                                });

                            tester.userName.click();

                            tester.statusesList.item('Не беспокоить').expectToBeSelected();
                            tester.body.expectTextContentNotToHaveSubstring('karadimova Не беспокоить');
                        });
                        it('Помещаю курсор над иконкой аккаунта. Список статусов не открывается.', function() {
                            tester.userName.putMouseOver();
                            tester.statusesList.item('Не беспокоить').expectNotToExist();
                        });
                        it('Нажимаю на цифру. Поле для ввода номера фокусируется.', function() {
                            utils.pressKey('7');
                            tester.phoneField.expectToBeFocused();
                        });
                        it('Получена новая версия. Отправлено сообщение в бэк электрона.', function() {
                            tester.applicationVersionChanged().receive();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('application-version-changed').
                                expectToBeSentWithArguments('6.6.666');
                        });
                        it('Некие сообщения выведены в лог.', function() {
                            tester.phoneField.expectNotToBeFocused();

                            getPackage('electron-log').expectToContain('State changed');
                            getPackage('electron-log').expectToContain('$REACT_APP_AUTH_URL');
                        });
                    });
                    it('SIP-линия не зарегистрирована. Раскрываю список статусов. Отображены статусы.', function() {
                        authenticatedUserRequest.sipIsOffline().receiveResponse();
                        tester.userName.click();

                        tester.statusesList.item('Не беспокоить').expectToBeSelected();
                    });
                });
                it('Не удалось авторизоваться в софтфоне.', function() {
                    authCheckRequest.invalidToken().receiveResponse();
                    tester.userLogoutRequest().receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 300,
                            height: 350
                        });
                    
                    tester.authLogoutRequest().invalidToken().receiveResponse();

                    tester.button('Войти').expectToBeVisible();
                });
            });
            it('Софтфон недоступен. Отображена форма аутентификации.', function() {
                accountRequest.softphoneUnavailable().receiveResponse();
                tester.userLogoutRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 300,
                        height: 350
                    });

                tester.button('Войти').expectToBeVisible();
            });
        });
        describe(
            'Настройки отображения поверх окон при входящем и скрывания при завершении звонка не сохранены.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();
                    
                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            describe('Поступил входящий звонок.', function() {
                let incomingCall;

                beforeEach(function() {
                    incomingCall = tester.incomingCall().receive();
                    tester.numaRequest().receiveResponse();
                    tester.outCallEvent().receive();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 568
                        });

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('incoming-call').
                        expectToBeSentWithArguments(true);
                });

                it('Звонок завершен. Отправлено сообщение о необходимости закрыть окно софтфона.', function() {
                    tester.stopCallButton.click();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 212
                        });

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-end').
                        expectToBeSentWithArguments(true);

                    incomingCall.expectTemporarilyUnavailableToBeSent();
                });
                it('Не одно сообщение не отправлено в бэк электрона.', function() {
                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectNotToBeSent();
                });
            });
            describe('Открываю настройки.', function() {
                beforeEach(function() {
                    tester.settingsButton.click();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 568
                        });
                });

                it('Снимаю отметку со свитчбокса "Скрывать после звонка". Отметка снята.', function() {
                    tester.button('Скрывать после звонка').click();

                    if (localStorage.getItem('clct:close_on_call_end') !== 'false') {
                        throw new Error('Значение свитчбокса должно быть сохранено.');
                    }

                    tester.button('Скрывать после звонка').expectNotToBeChecked();
                });
                it('Свитчбоксы "Открывать во время звонка" и "Скрывать после звонка" отмечены.', function() {
                    tester.button('Открывать во время звонка').expectToBeChecked();
                    tester.button('Скрывать после звонка').expectToBeChecked();
                });
            });
        });
        describe('Софтфон должен отображаться поверх окон при входящем.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:to_top_on_call', 'true');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it('Поступил входящий звонок. Отправлено сообщение о необходимости поднять окно софтфона.', function() {
                tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);
            });
            it('Открываю настройки. Свитчбокс "Открывать во время звонка" отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Открывать во время звонка').expectToBeChecked();
            });
        });
        describe('Софтфон не должен скрываться после звонка.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:close_on_call_end', 'false');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it(
                'Поступил входящий звонок. Звонок завершен. Отправлено сообщение о том, что скрывать окно софтфона ' +
                'не нужно.',
            function() {
                const incomingCall = tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);

                tester.stopCallButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-end').
                    expectToBeSentWithArguments(false);

                incomingCall.expectTemporarilyUnavailableToBeSent();
            });
            it('Открываю настройки. Свитчбокс "Скрывать после звонка" не отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Открывать во время звонка').expectToBeChecked();
                tester.button('Скрывать после звонка').expectNotToBeChecked();
            });
        });
        describe('Софтфон должен скрываться после звонка.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:close_on_call_end', 'true');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it(
                'Поступил входящий звонок. Звонок завершен. Отправлено сообщение о необходимости скрыть окно софтфона.',
            function() {
                const incomingCall = tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);

                tester.stopCallButton.click();
                
                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-end').
                    expectToBeSentWithArguments(true);

                incomingCall.expectTemporarilyUnavailableToBeSent();
            });
            it('Открываю настройки. Свитчбокс "Скрывать после звонка" отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Скрывать после звонка').expectToBeChecked();
            });
        });
        it('Я уже аутентифицирован. Плейсхолдер поля для ввода номера локализован.', function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true,
                appName: 'softphone'
            });

            tester.configRequest().softphone().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 212
                });

            getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

            tester.accountRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('feature-flags-fetched').
                expectToBeSentWithArguments(['softphone', undefined]);

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();
            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            tester.allowMediaInput();

            tester.authenticatedUserRequest().receiveResponse();
            tester.registrationRequest().desktopSoftphone().receiveResponse();

            tester.phoneField.expectToHaveValue('Введите номер');
        });
    });
});