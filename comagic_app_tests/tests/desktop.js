tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        addSecond,
        windowOpener,
        setFocus,
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

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        describe('Софтфон не должен отображаться поверх окон при входящем.', function() {
            let authenticatedUserRequest,
                accountRequest;

            beforeEach(function() {
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

                        xdescribe('Поступает входящий звонок от пользователя имеющего открытые сделки.', function() {
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

                            describe('Нажимаю на клавишу Enter. Звонок принят.', function() {
                                beforeEach(function() {
                                    utils.pressEnter();

                                    tester.firstConnection.connectWebRTC();
                                    tester.firstConnection.callTrackHandler();

                                    tester.allowMediaInput();
                                    tester.firstConnection.addCandidate();
                                    
                                    incomingCall.expectOkToBeSent().receiveResponse();
                                });

                                describe('Убираю фокус с окна.', function() {
                                    beforeEach(function() {
                                        setFocus(false);
                                    });

                                    describe('Фокусирую окно.', function() {
                                        beforeEach(function() {
                                            setFocus(true);
                                        });

                                        it(
                                            'Совершаю клик. Нажимаю на кнопку диалпада. Отправляется DTMF. Звучит тон.',
                                        function() {
                                            tester.nameOrPhone.click();

                                            utils.pressKey('7');
                                            tester.dtmf('7').expectToBeSent();

                                            tester.expectToneSevenToPlay();
                                        });
                                        it(
                                            'Нажимаю на кнопку диалпада. DTMF не отправляется. Тон не звучит.',
                                        function() {
                                            utils.pressKey('7');
                                        });
                                    });
                                    it('Нажимаю на кнопку диалпада. DTMF не отправляется. Тон не звучит.', function() {
                                        utils.pressKey('7');
                                    });
                                });
                                it('Нажимаю на кнопку диалпада. Отправляется DTMF. Звучит тон.', function() {
                                    utils.pressKey('7');
                                    tester.dtmf('7').expectToBeSent();

                                    tester.expectToneSevenToPlay();
                                });
                            });
                            it('Нажимаю на клавишу Esc. Звонок отклоняется.', function() {
                                utils.pressEscape();

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
                            it('Нажимаю на открытую сделку. Открывается страница сделки.', function() {
                                tester.anchor('По звонку с 79154394340').click();

                                getPackage('electron').shell.expectExternalUrlToBeOpened(
                                    'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                );
                            });
                        });
                        xdescribe('Нажимаю на кнопку переключения на большой размер.', function() {
                            beforeEach(function() {
                                tester.largeSizeButton.click();

                                tester.configRequest().softphone().receiveResponse();
                                const requests = ajax.inAnyOrder();

                                const statsRequest = tester.statsRequest().expectToBeSent(requests),
                                    numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent(requests),
                                    accountRequest = tester.accountRequest().expectToBeSent(requests),
                                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                                requests.expectToBeSent();

                                statsRequest.receiveResponse();
                                numberCapacityRequest.receiveResponse();
                                accountRequest.receiveResponse();
                                secondAccountRequest.receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('maximize');
                            });

                            describe('Нажимаю на кнопку переключения на большой размер.', function() {
                                beforeEach(function() {
                                    tester.largeSizeButton.click();
                                });

                                describe('Нажимаю на кнопку переключения на маленький размер.', function() {
                                    beforeEach(function() {
                                        tester.smallSizeButton.click();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('unmaximize');

                                        tester.configRequest().softphone().receiveResponse();
                                        tester.numberCapacityRequest().receiveResponse();
                                        tester.accountRequest().receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('resize').
                                            expectToBeSentWithArguments({
                                                width: 340,
                                                height: 212
                                            });
                                    });

                                    it(
                                        'Нажимаю на кнопку переключения на маленький размер. Диалпад скрыт.',
                                    function() {
                                        tester.smallSizeButton.click();

                                        tester.smallSizeButton.expectToBePressed();
                                        tester.middleSizeButton.expectNotToBePressed();
                                        tester.largeSizeButton.expectNotToBePressed();
                                    });
                                    it('Диалпад скрыт.', function() {
                                        tester.smallSizeButton.expectToBePressed();
                                        tester.middleSizeButton.expectNotToBePressed();
                                        tester.largeSizeButton.expectNotToBePressed();

                                        if (localStorage.getItem('isLarge') === 'true') {
                                            throw new Error(
                                                'В локальном хранилище должна быть сохранена ' +
                                                'развернутость софтфона.'
                                            );
                                        }
                                    });
                                });
                                describe('Нажимаю на кнопку переключения на средний размер.', function() {
                                    beforeEach(function() {
                                        tester.middleSizeButton.click();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('unmaximize');

                                        tester.configRequest().softphone().receiveResponse();
                                        tester.numberCapacityRequest().receiveResponse();
                                        tester.accountRequest().receiveResponse();
                                    });

                                    it(
                                        'Нажимаю на кнопку переключения на средний размер. Отображен диалпад.',
                                    function() {
                                        tester.middleSizeButton.click();

                                        tester.dialpadButton(1).expectToBeVisible();;

                                        tester.smallSizeButton.expectNotToBePressed();
                                        tester.middleSizeButton.expectToBePressed();
                                        tester.largeSizeButton.expectNotToBePressed();
                                    });
                                    it('Отображен диалпад.', function() {
                                        tester.smallSizeButton.expectNotToBePressed();
                                        tester.middleSizeButton.expectToBePressed();
                                        tester.largeSizeButton.expectNotToBePressed();
                                    });
                                });
                                it('Получено сообщение о минимизации. Софтфон открыт в среднем размере.', function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('unmaximize');

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('unmaximize');

                                    tester.configRequest().softphone().receiveResponse();
                                    tester.numberCapacityRequest().receiveResponse();
                                    tester.accountRequest().receiveResponse();

                                    tester.settingsButton.expectToBeEnabled();
                                    tester.callsHistoryButton.expectToBeEnabled();
                                    tester.softphone.userName.expectToBeEnabled();

                                    tester.smallSizeButton.expectNotToBePressed();
                                    tester.middleSizeButton.expectToBePressed();
                                    tester.largeSizeButton.expectNotToBePressed();
                                });
                                it('Отображен диалпад.', function() {
                                    tester.dialpadButton(1).expectToBeVisible();;

                                    tester.smallSizeButton.expectNotToBePressed();
                                    tester.middleSizeButton.expectNotToBePressed();
                                    tester.largeSizeButton.expectToBePressed();
                                });
                            });
                            describe('Нажимаю на кнопку "Настройки".', function() {
                                beforeEach(function() {
                                    tester.button('Настройки').click();
                                });

                                it(
                                    'Нажимаю на кнопку "Софтфон или IP-телефон". Отмечена кнопка "IP-телефон".',
                                function() {
                                    tester.button('IP-телефон').click();
                                    tester.settingsUpdatingRequest().callsAreManagedByAnotherDevice().receiveResponse();
                                    tester.settingsRequest().callsAreManagedByAnotherDevice().receiveResponse();

                                    tester.registrationRequest().desktopSoftphone().expired().receiveResponse();
                                    
                                    spendTime(2000);
                                    tester.webrtcWebsocket.finishDisconnecting();

                                    tester.dialpadButton(1).expectToBeVisible();;

                                    tester.button('Текущее устройство').expectNotToBeChecked();
                                    tester.button('IP-телефон').expectToBeChecked();
                                });
                                it('Открыта страница настроек.', function() {
                                    tester.button('Статистика').expectNotToBePressed();
                                    tester.button('История звонков').expectNotToBePressed();
                                    tester.button('Настройки').expectToBePressed();

                                    tester.button('Автозапуск приложения').expectToBeVisible();

                                    tester.button('Текущее устройство').expectToBeChecked();
                                    tester.button('IP-телефон').expectNotToBeChecked();
                                });
                            });
                            it('Получено сообщение о максимизации. Ничего не происходит.', function() {
                                getPackage('electron').ipcRenderer.receiveMessage('maximize');

                                tester.smallSizeButton.expectNotToBePressed();
                                tester.middleSizeButton.expectNotToBePressed();
                                tester.largeSizeButton.expectToBePressed();
                            });
                            it('Нажимаю на кнпоку "История звонков". Открыта история звонков.', function() {
                                tester.button('История звонков').click();

                                tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                                tester.marksRequest().receiveResponse();
                            });
                            it('Нажимаю на кнопку аккаунта в меню. Отображена всплывающая панель.', function() {
                                tester.leftMenu.userName.click();
                                tester.statusesList.expectTextContentToHaveSubstring('Ганева Стефка');
                            });
                            it('Нажимаю на кнопку аккаунта в софтфоне. Всплывающая панель не отображена .', function() {
                                tester.softphone.userName.click();
                                tester.statusesList.expectNotToExist();
                            });
                            it('Отображен большой софтфон.', function() {
                                tester.button('Статистика').expectToBePressed();
                                tester.button('История звонков').expectNotToBePressed();
                                tester.button('Настройки').expectNotToBePressed();

                                tester.dialpadButton(1).expectToBeVisible();;

                                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
                                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-pressed');

                                tester.settingsButton.expectToBeDisabled();
                                tester.callsHistoryButton.expectToBeDisabled();
                                tester.softphone.userName.expectToBeDisabled();

                                tester.smallSizeButton.expectNotToBePressed();
                                tester.middleSizeButton.expectNotToBePressed();
                                tester.largeSizeButton.expectToBePressed();

                                if (localStorage.getItem('isLarge') !== 'true') {
                                    throw new Error(
                                        'В локальном хранилище должна быть сохранена максимизация софтфона.'
                                    );
                                }
                            });
                        });
                        xdescribe('Нажимаю на кнопку переключения на средний размер.', function() {
                            beforeEach(function() {
                                tester.middleSizeButton.click();
                                tester.middleSizeButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });
                            });

                            it('Нажимаю на кнопку переключения на маленький размер. Диалпад скрыт.', function() {
                                tester.smallSizeButton.click();
                                tester.smallSizeButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.smallSizeButton.expectToBePressed();
                                tester.middleSizeButton.expectNotToBePressed();
                                tester.largeSizeButton.expectNotToBePressed();
                            });
                            it('Отображен диалпад.', function() {
                                tester.dialpadButton(1).expectToBeVisible();;

                                tester.smallSizeButton.expectNotToBePressed();
                                tester.middleSizeButton.expectToBePressed();
                                tester.largeSizeButton.expectNotToBePressed();
                            });
                        });
                        xdescribe('Раскрываю список статусов.', function() {
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
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.configRequest().softphone().receiveResponse();

                                tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

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
                        xdescribe('Нажимаю на кнопку дебага.', function() {
                            beforeEach(function() {
                                tester.bugButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('collect_logs');
                            });

                            it('Логи собраны. Загружается архив с логами. Спиннер скрыт.', function() {
                                getPackage('electron').ipcRenderer.receiveMessage(
                                    'logs_collected',
                                    new JsTester_ZipArchive()
                                );

                                blobsTester.getLast().
                                    expectToHaveType('application/zip').
                                    expectToBeCreatedFromArray(new JsTester_ZipArchive());

                                tester.spinner.expectNotToExist();
                            });
                            it('Отображен спиннер.', function() {
                                tester.spinner.expectToBeVisible();
                            });
                        });
                        xdescribe('Открываю таблицу сотрудников. Токен истек.', function() {
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
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                tester.configRequest().softphone().receiveResponse();
                                tester.authCheckRequest().receiveResponse();

                                tester.usersRequest().receiveResponse(),
                                tester.usersInGroupsRequest().receiveResponse(),
                                tester.groupsRequest().receiveResponse();

                                tester.accountRequest().receiveResponse();
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
                        xdescribe('Открываю историю звонков.', function() {
                            let callsRequest;

                            beforeEach(function() {
                                tester.callsHistoryButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                callsRequest = tester.callsRequest().expectToBeSent();
                                addSecond();
                            });

                            describe('Данные получены.', function() {
                                beforeEach(function() {
                                    callsRequest.receiveResponse();
                                });

                                it('Нажимаю на имя контакта. Открывается страница контакта.', function() {
                                    tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                                    getPackage('electron').shell.expectExternalUrlToBeOpened(
                                        'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                    );
                                });
                                it('Спиннер скрыт.', function() {
                                    getPackage('electron-log').expectToContain([
                                        'Ajax request',
                                        'URL "sup/api/v1/users/me/calls"',
                                        'Time consumed 1000 ms'
                                    ].join("\n"));

                                    tester.spin.expectNotToExist();
                                });
                            });
                            it('Не удалось получить данные. Спиннер скрыт.', function() {
                                callsRequest.serverError().receiveResponse();
                                tester.spin.expectNotToExist();

                                getPackage('electron-log').expectToContain([
                                    'Ajax request',
                                    'URL "sup/api/v1/users/me/calls"',
                                    'Time consumed 1000 ms'
                                ].join("\n"));
                            });
                            it('Отображен спиннер.', function() {
                                tester.spin.expectToBeVisible();
                            });
                        });
                        xdescribe('Открываю список номеров.', function() {
                            beforeEach(function() {
                                windowSize.setHeight(212);

                                tester.select.arrow.click();
                                tester.numberCapacityRequest().receiveResponse();
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
                                tester.numberCapacityRequest().receiveResponse();

                                tester.select.popup.expectToHaveTopOffset(92);
                                tester.select.popup.expectToHaveHeight(331);

                                tester.button('Отменить').expectNotToExist();
                            });
                            it('Список вписан в окно.', function() {
                                tester.select.popup.expectToHaveTopOffset(4);
                                tester.select.popup.expectToHaveHeight(204);
                            });
                        });
                        describe(
                            'Ввожу номер телефона. Нажимаю на кнпоку вызова. Поступил входящий звонок.',
                        function() {
                            beforeEach(function() {
                                tester.phoneField.fill('79161234567');
                                tester.callStartingButton.click();

                                tester.firstConnection.connectWebRTC();
                                tester.allowMediaInput();

                                tester.outgoingCall().start().setRinging().setAccepted();
                                tester.firstConnection.callTrackHandler();

                                tester.numaRequest().receiveResponse();
                                tester.outCallSessionEvent().receive();

                                tester.incomingCall().thirdNumber().receive();
                                tester.numaRequest().thirdNumber().receiveResponse();
                                tester.outCallEvent().anotherPerson().receive();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 276
                                    });

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('incoming-call').
                                    expectToBeSentWithArguments(false);
                            });

                            xit('Нажимаю на кнопку большого размера.', function() {
                                tester.largeSizeButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('maximize');

                                tester.configRequest().softphone().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 632
                                    });

                                const requests = ajax.inAnyOrder();

                                const statsRequest = tester.statsRequest().expectToBeSent(requests),
                                    numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent(requests),
                                    accountRequest = tester.accountRequest().expectToBeSent(requests),
                                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                                requests.expectToBeSent();

                                statsRequest.receiveResponse();
                                numberCapacityRequest.receiveResponse();
                                accountRequest.receiveResponse();
                                secondAccountRequest.receiveResponse();
                            });
                            xit('Нажимаю на кнопку диалпада. Обновлен размер.', function() {
                                tester.dialpadVisibilityButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 632
                                    });
                            });
                            it('Отображено сообщение о звонке.', function() {
                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Гигова Петранка Входящий (2-ая линия)...'
                                );
                            });
                        });
                        return;
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
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 212
                                });

                            tester.configRequest().softphone().receiveResponse();

                            tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                            tester.accountRequest().anotherAuthorizationToken().receiveResponse();
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
                        it('Сотрудник развернул софтфон. Софтфон открыт в большом размере.', function() {
                            getPackage('electron').ipcRenderer.receiveMessage('maximize');

                            tester.configRequest().softphone().receiveResponse();
                            const requests = ajax.inAnyOrder();

                            const statsRequest = tester.statsRequest().expectToBeSent(requests),
                                numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent(requests),
                                accountRequest = tester.accountRequest().expectToBeSent(requests),
                                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            statsRequest.receiveResponse();
                            numberCapacityRequest.receiveResponse();
                            accountRequest.receiveResponse();
                            secondAccountRequest.receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 568
                                });

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('maximize');

                            tester.settingsButton.expectToBeDisabled();
                            tester.callsHistoryButton.expectToBeDisabled();
                            tester.softphone.userName.expectToBeDisabled();

                            tester.smallSizeButton.expectNotToBePressed();
                            tester.middleSizeButton.expectNotToBePressed();
                            tester.largeSizeButton.expectToBePressed();
                        });
                        it('Некие сообщения выведены в лог.', function() {
                            tester.phoneField.expectNotToBeFocused();
                            tester.collapsednessToggleButton.expectNotToExist();

                            tester.smallSizeButton.expectToBePressed();
                            tester.middleSizeButton.expectNotToBePressed();
                            tester.largeSizeButton.expectNotToBePressed();

                            getPackage('electron-log').expectToContain('State changed');
                            getPackage('electron-log').expectToContain('$REACT_APP_AUTH_URL');

                            if (localStorage.getItem('isLarge') === 'true') {
                                throw new Error(
                                    'В локальном хранилище должна быть сохранена максимизация софтфона.'
                                );
                            }
                        });
                    });
                    return;
                    it('SIP-линия не зарегистрирована. Раскрываю список статусов. Отображены статусы.', function() {
                        authenticatedUserRequest.sipIsOffline().receiveResponse();
                        tester.userName.click();

                        tester.statusesList.item('Не беспокоить').expectToBeSelected();
                    });
                });
                return;
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
            return;
            it('Большой софтфон недоступен. Кнопки размеров не отображены.', function() {
                accountRequest.largeSoftphoneFeatureFlagDisabled().receiveResponse();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();

                tester.collapsednessToggleButton.expectToBeVisible();

                tester.smallSizeButton.expectNotToExist();
                tester.middleSizeButton.expectNotToExist();
                tester.largeSizeButton.expectNotToExist();
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
        return;
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
        it('Ранее софтфон был раскрыт. Открываю софтфон. Он раскрыт.', function() {
            localStorage.setItem('isSoftphoneHigh', 'true');

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
                    height: 568
                });

            getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

            tester.accountRequest().receiveResponse();
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

            tester.dialpadButton(1).expectToBeVisible();;
        });
        it('Ранее софтфон был большим. Открываю софтфон. Он большой.', function() {
            localStorage.setItem('isSoftphoneHigh', 'true');
            localStorage.setItem('isLarge', 'true');

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
                    height: 568
                });

            getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

            tester.accountRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('maximize');

            tester.authCheckRequest().receiveResponse();

            const requests = ajax.inAnyOrder();

            const statsRequest = tester.statsRequest().secondEarlier().expectToBeSent(requests),
                accountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            statsRequest.receiveResponse();
            accountRequest.receiveResponse();

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

            tester.configRequest().softphone().receiveResponse();
            tester.accountRequest().receiveResponse();

            tester.dialpadButton(1).expectToBeVisible();;
        });
    });
});
