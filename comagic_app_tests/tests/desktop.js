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
                accountRequest,
                secondAccountRequest;

            beforeEach(function() {
                localStorage.setItem('clct:to_top_on_call', 'false');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('opened');
            });

            describe('Логины и пароли не были сохранены. Ввожу логин и пароль.', function() {
                beforeEach(function() {
                    getPackage('electron').ipcRenderer.receiveMessage('credentials', []);

                    tester.input.withFieldLabel('Логин').fill('botusharova');
                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');
                });

                describe('Нажимаю на кнопку входа.', function() {
                    beforeEach(function() {
                        tester.button('Войти').click();
                        tester.loginRequest().receiveResponse();

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('app-ready');

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('resize').
                            expectToBeSentWithArguments({
                                width: 340,
                                height: 212
                            });

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('login').
                            expectToBeSentWithArguments({
                                login: 'botusharova',
                                password: '8Gls8h31agwLf5k',
                                project: 'comagic',
                            });

                        getPackage('electron').ipcRenderer.receiveMessage('credentials', [{
                            login: 'botusharova',
                            password: '8Gls8h31agwLf5k',
                            project: 'comagic',
                        }]);

                        accountRequest = tester.accountRequest().expectToBeSent();
                    });

                    describe('Софтфон доступен.', function() {
                        let authCheckRequest,
                            secondAccountRequest,
                            thirdAccountRequest;

                        beforeEach(function() {
                            accountRequest.operatorWorkplaceAvailable().receiveResponse();

                            tester.employeesWebSocket.connect();
                            tester.employeesInitMessage().expectToBeSent();

                            const requests = ajax.inAnyOrder();

                            authCheckRequest = tester.authCheckRequest().
                                expectToBeSent(requests);

                            secondAccountRequest = tester.accountRequest().
                                operatorWorkplaceAvailable().
                                forChats().
                                expectToBeSent(requests);

                            thirdAccountRequest = tester.accountRequest().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();
                        });

                        describe('Софтфон авторизован.', function() {
                            let countersRequest,
                                newChatListRequest,
                                activeChatListRequest,
                                closedChatListRequest,
                                offlineMessageCountersRequest;

                            beforeEach(function() {
                                thirdAccountRequest.receiveResponse();
                                authCheckRequest.receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();

                                tester.permissionsRequest().
                                    allowNumberCapacitySelect().
                                    allowNumberCapacityUpdate().
                                    receiveResponse();

                                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.connectSIPWebSocket();

                                notificationTester.grantPermission();
                                tester.employeeStatusesRequest().receiveResponse();
                                tester.numberCapacityRequest().receiveResponse();

                                tester.employeeRequest().receiveResponse();
                                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                                tester.registrationRequest().desktopSoftphone().receiveResponse();
                                secondAccountRequest.receiveResponse();
                                
                                tester.chatsWebSocket.connect();
                                tester.chatsInitMessage().expectToBeSent();

                                countersRequest = tester.countersRequest().expectToBeSent();
                                offlineMessageCountersRequest = tester.offlineMessageCountersRequest().expectToBeSent();
                                tester.chatChannelListRequest().receiveResponse();
                                tester.siteListRequest().receiveResponse();
                                tester.markListRequest().receiveResponse();
                                    
                                newChatListRequest = tester.chatListRequest().forCurrentEmployee().
                                    expectToBeSent();
                                activeChatListRequest = tester.chatListRequest().forCurrentEmployee().active().
                                    expectToBeSent();
                                closedChatListRequest = tester.chatListRequest().forCurrentEmployee().closed().
                                    expectToBeSent();

                                tester.chatChannelTypeListRequest().receiveResponse();

                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                tester.offlineMessageListRequest().processing().receiveResponse();
                                tester.offlineMessageListRequest().processed().receiveResponse();
                            });

                            describe('Нет непрочитанных заявок.', function() {
                                beforeEach(function() {
                                    offlineMessageCountersRequest.receiveResponse();
                                });

                                describe('Есть непрочитанные сообщения.', function() {
                                    beforeEach(function() {
                                        countersRequest.receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('set-icon').
                                            expectToBeSentWithArguments('windows, 150');

                                        newChatListRequest.receiveResponse();
                                        activeChatListRequest.receiveResponse();
                                        closedChatListRequest.receiveResponse();
                                    });

                                    describe('SIP-линия зарегистрирована.', function() {
                                        beforeEach(function() {
                                            authenticatedUserRequest.receiveResponse();
                                        });

                                        describe('Получен доступ к микрофону.', function() {
                                            beforeEach(function() {
                                                tester.allowMediaInput();
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
                                                        getPackage('electron').ipcRenderer.
                                                            receiveMessage('checkautolauncher', {
                                                                isStartApp: true
                                                            });
                                                    });

                                                    it(
                                                        'Отмечаю переключатель "Запускать свернуто". Отправлено ' +
                                                        'событие о необходимости запускать софтфон свернуто.',
                                                    function() {
                                                        tester.button('Запускать свернуто').click();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('startminimizechange').
                                                            expectToBeSentWithArguments(true);

                                                        tester.button('Открывать во время звонка').
                                                            expectNotToBeChecked();
                                                        tester.button('Автозапуск приложения').expectToBeChecked();
                                                        tester.button('Запускать свернуто').expectToBeChecked();
                                                    });
                                                    it('Приложение должно запускаться свернутым.', function() {
                                                        getPackage('electron').ipcRenderer.receiveMessage(
                                                            'checkstartminimize',
                                                            {
                                                                isStartMinimize: true
                                                            }
                                                        );

                                                        tester.button('Открывать во время звонка').
                                                            expectNotToBeChecked();
                                                        tester.button('Автозапуск приложения').expectToBeChecked();
                                                        tester.button('Запускать свернуто').expectToBeChecked();
                                                    });
                                                    it('Форма настроек корректно заполнена.', function() {
                                                        tester.button('Открывать во время звонка').
                                                            expectNotToBeChecked();
                                                        tester.button('Автозапуск приложения').expectToBeChecked();

                                                        tester.button('Запускать свернуто').expectToBeEnabled();
                                                        tester.button('Запускать свернуто').expectNotToBeChecked();
                                                    });
                                                });
                                                it(
                                                    'Нажимаю на кнопку максимизации. Открыт раздел настроек.',
                                                function() {
                                                    tester.maximizednessButton.click();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('maximize');

                                                    const requests = ajax.inAnyOrder();

                                                    tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        forChats().
                                                        receiveResponse();

                                                    const countersRequest = tester.countersRequest().
                                                        expectToBeSent(requests);

                                                    const offlineMessageCountersRequest = tester.
                                                        offlineMessageCountersRequest().
                                                        expectToBeSent(requests);

                                                    const chatChannelListRequest = tester.chatChannelListRequest().
                                                        expectToBeSent(requests);

                                                    const siteListRequest = tester.siteListRequest().
                                                        expectToBeSent(requests);

                                                    const markListRequest = tester.markListRequest().
                                                        expectToBeSent(requests);

                                                    const newChatListRequest = tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        expectToBeSent(requests);

                                                    const activeChatListRequest = tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        active().
                                                        expectToBeSent(requests);

                                                    const closedChatListRequest = tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        closed().
                                                        expectToBeSent(requests);

                                                    const chatChannelTypeListRequest =
                                                        tester.chatChannelTypeListRequest().
                                                        expectToBeSent(requests);

                                                    const notProcessedOfflineMessageListRequest = tester.
                                                        offlineMessageListRequest().
                                                        notProcessed().
                                                        expectToBeSent(requests);

                                                    const processingOfflineMessageListRequest = tester.
                                                        offlineMessageListRequest().
                                                        processing().
                                                        expectToBeSent(requests);

                                                    const processedOfflineMessageListRequest = tester.
                                                        offlineMessageListRequest().
                                                        processed().
                                                        expectToBeSent(requests);

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    countersRequest.receiveResponse();
                                                    offlineMessageCountersRequest.receiveResponse();
                                                    chatChannelListRequest.receiveResponse();
                                                    siteListRequest.receiveResponse();
                                                    markListRequest.receiveResponse();
                                                    newChatListRequest.receiveResponse();
                                                    activeChatListRequest.receiveResponse();
                                                    closedChatListRequest.receiveResponse();
                                                    chatChannelTypeListRequest.receiveResponse();
                                                    notProcessedOfflineMessageListRequest.receiveResponse();
                                                    processingOfflineMessageListRequest.receiveResponse();
                                                    processedOfflineMessageListRequest.receiveResponse();
                                                    accountRequest.receiveResponse();

                                                    tester.button('Автозапуск приложения').expectToBeVisible();
                                                    tester.dialpadButton(1).expectToBeVisible();

                                                    tester.settingsButton.expectToBePressed();
                                                    tester.chatsButton.expectNotToBePressed();
                                                    tester.callsHistoryButton.expectNotToBePressed();
                                                });
                                                it(
                                                    'Отмечаю свитчбокс "Автозапуск приложения". Отправлено сообщение ' +
                                                    'о необходимости запускать приложение автоматически.',
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
                                                    'Отмечаю свитчбокс "Открывать во время звонка". Значение ' +
                                                    'параметра сохранено.',
                                                function() {
                                                    tester.button('Открывать во время звонка').click();

                                                    tester.button('Открывать во время звонка').expectToBeChecked();
                                                    tester.button('Автозапуск приложения').expectNotToBeChecked();
                                                    tester.button('Запускать свернуто').expectNotToBeChecked();

                                                    if (localStorage.getItem('clct:to_top_on_call') !== 'true') {
                                                        throw new Error(
                                                            'Значение параметра "Открывать во время звонка" должно ' +
                                                            'быть сохранено.'
                                                        );
                                                    }
                                                });
                                                it(
                                                    'Нажимаю на кнопку "Смена статуса". Нажима на кнопку ' +
                                                    '"Автоматически".',
                                                function() {
                                                    tester.button('Автоматически').click();

                                                    tester.settingsUpdatingRequest().
                                                        autoSetStatus().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        autoSetStatus().
                                                        receiveResponse();

                                                    tester.fieldRow('При входе').select.arrow.click();
                                                    tester.select.option('Перерыв').click();

                                                    tester.settingsUpdatingRequest().
                                                        pauseOnLogin().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        autoSetStatus().
                                                        pauseOnLogin().
                                                        receiveResponse();

                                                    tester.fieldRow('При выходе').select.arrow.click();
                                                    tester.select.option('Не беспокоить').click();

                                                    tester.settingsUpdatingRequest().
                                                        dontDisturbOnLogout().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        autoSetStatus().
                                                        pauseOnLogin().
                                                        dontDisturbOnLogout().
                                                        receiveResponse();

                                                    tester.fieldRow('При входе').select.
                                                        expectToHaveTextContent('Перерыв');

                                                    tester.fieldRow('При выходе').select.
                                                        expectToHaveTextContent('Не беспокоить');
                                                });
                                                it(
                                                    'Нажимаю на кнопку "Общие настройки". Нажимаю на кнопку "Софтфон ' +
                                                    'или IP-телефон". Отмечена кнопка "IP-телефон".',
                                                function() {
                                                    tester.button('IP-телефон').click();

                                                    tester.settingsUpdatingRequest().
                                                        callsAreManagedByAnotherDevice().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        callsAreManagedByAnotherDevice().
                                                        receiveResponse();

                                                    tester.registrationRequest().
                                                        desktopSoftphone().
                                                        expired().
                                                        receiveResponse();
                                                    
                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.button('Текущее устройство').expectNotToBeChecked();
                                                    tester.button('IP-телефон').expectToBeChecked();
                                                });
                                                it(
                                                    'Прошло некоторое время. Сервер событий не отвечает. Отображено ' +
                                                    'сообщение об установке соединения.',
                                                function() {
                                                    spendTime(5000);
                                                    tester.expectPingToBeSent();
                                                    tester.employeesPing().expectToBeSent();
                                                    spendTime(2000);
                                                    spendTime(0);

                                                    tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                                                });
                                                it('Открываю вкладку "Звук". Отображены настройки звука.', function() {
                                                    tester.button('Звук').click();

                                                    tester.body.
                                                        expectTextContentToHaveSubstring('Громкость звонка 100%');
                                                });
                                                it('Форма настроек заполнена правильно.', function() {
                                                    tester.button('Текущее устройство').expectToBeChecked();
                                                    tester.button('IP-телефон').expectNotToBeChecked();

                                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                                    tester.button('Скрывать после звонка').expectToBeChecked();
                                                    tester.button('Автозапуск приложения').expectNotToBeChecked();

                                                    tester.button('Запускать свернуто').expectNotToBeChecked();
                                                    tester.button('Запускать свернуто').expectToBeDisabled();

                                                    tester.maximizednessButton.expectToBeUnmaximized();
                                                    tester.collapsednessToggleButton.expectToBeExpanded();
                                                });
                                            });
                                            describe(
                                                'Поступает входящий звонок от пользователя имеющего открытые сделки.',
                                            function() {
                                                let incomingCall;

                                                beforeEach(function() {
                                                    incomingCall = tester.incomingCall().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

                                                    tester.numaRequest().receiveResponse();
                                                    tester.outCallEvent().activeLeads().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });
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
                                                                'Совершаю клик. Нажимаю на кнопку диалпада. ' +
                                                                'Отправляется DTMF. Звучит тон.',
                                                            function() {
                                                                tester.nameOrPhone.click();

                                                                utils.pressKey('7');
                                                                tester.dtmf('7').expectToBeSent();

                                                                tester.expectToneSevenToPlay();
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку диалпада. DTMF не отправляется. ' +
                                                                'Тон не звучит.',
                                                            function() {
                                                                utils.pressKey('7');
                                                            });
                                                        });
                                                        it(
                                                            'Нажимаю на кнопку диалпада. DTMF не отправляется. Тон ' +
                                                            'не звучит.',
                                                        function() {
                                                            utils.pressKey('7');
                                                        });
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку диалпада. Отправляется DTMF. Звучит тон.',
                                                    function() {
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

                                                    incomingCall.expectBusyHereToBeSent();
                                                });
                                                it(
                                                    'Нажимаю на открытую сделку. Открывается страница сделки.',
                                                function() {
                                                    tester.anchor('По звонку с 79154394340').click();

                                                    getPackage('electron').shell.expectExternalUrlToBeOpened(
                                                        'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                                    );
                                                });
                                                it('Нажимаю на кнопку открытия контакта.', function() {
                                                    tester.contactOpeningButton.click();

                                                    getPackage('electron').shell.expectExternalUrlToBeOpened(
                                                        'https://comagicwidgets.amocrm.ru/contacts/detail/382030'
                                                    );
                                                });
                                            });
                                            describe('Нажимаю на кнопку максимизации.', function() {
                                                beforeEach(function() {
                                                    tester.maximizednessButton.click();

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
                                                    
                                                    const requests = ajax.inAnyOrder();

                                                    const statsRequest = tester.statsRequest().
                                                        expectToBeSent(requests);

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        forChats().
                                                        expectToBeSent(requests);

                                                    const secondAccountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    statsRequest.receiveResponse();
                                                    accountRequest.receiveResponse();
                                                    secondAccountRequest.receiveResponse();

                                                    tester.countersRequest().receiveResponse();

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                                    tester.offlineMessageListRequest().processed().receiveResponse();
                                                });

                                                describe('Открываю раздел чатов.', function() {
                                                    beforeEach(function() {
                                                        tester.button('Чаты').click();

                                                        tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            forChats().
                                                            receiveResponse();

                                                        tester.chatSettingsRequest().receiveResponse();
                                                        tester.chatChannelListRequest().receiveResponse();
                                                        tester.statusListRequest().receiveResponse();
                                                        tester.listRequest().receiveResponse();
                                                        tester.siteListRequest().receiveResponse();
                                                        tester.messageTemplateListRequest().receiveResponse();
                                                    });

                                                    it('Выбираю чат. Чат открыт.', function() {
                                                        tester.chatList.input.fill('Сообщение #75');

                                                        tester.chatList.input.pressEnter();
                                                        tester.searchResultsRequest().receiveResponse();

                                                        tester.chatList.item('Сообщение #75').click();

                                                        tester.chatListRequest().thirdChat().receiveResponse();
                                                        tester.visitorCardRequest().receiveResponse();
                                                        tester.messageListRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                    });
                                                    it('Сворачиваю софтофон.', function() {
                                                        tester.maximizednessButton.click();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('unmaximize');
                                                    });
                                                    it('Пункт меню чатов выделен.', function() {
                                                        tester.button('Чаты').expectToBePressed();
                                                        tester.button('Заявки').expectNotToBePressed();
                                                        tester.button('Статистика').expectNotToBePressed();
                                                        tester.button('История звонков').expectNotToBePressed();
                                                        tester.button('Настройки').expectNotToBePressed();
                                                    });
                                                });
                                                describe('Нажимаю на кнопку "Настройки".', function() {
                                                    beforeEach(function() {
                                                        tester.button('Настройки').click();
                                                    });

                                                    it(
                                                        'Нажимаю на кнопку "Софтфон или IP-телефон". Отмечена кнопка ' +
                                                        '"IP-телефон".',
                                                    function() {
                                                        tester.button('IP-телефон').click();

                                                        tester.settingsUpdatingRequest().
                                                            callsAreManagedByAnotherDevice().
                                                            receiveResponse();

                                                        tester.settingsRequest().callsAreManagedByAnotherDevice().
                                                            receiveResponse();

                                                        tester.registrationRequest().desktopSoftphone().expired().
                                                            receiveResponse();
                                                        
                                                        spendTime(2000);
                                                        tester.webrtcWebsocket.finishDisconnecting();

                                                        tester.dialpadButton(1).expectToBeVisible();

                                                        tester.button('Текущее устройство').expectNotToBeChecked();
                                                        tester.button('IP-телефон').expectToBeChecked();
                                                    });
                                                    it(
                                                        'Открываю вкладку "Помощь". Отображена форма обратной связи.',
                                                    function() {
                                                        tester.button('Помощь').click();
                                                        tester.button('Отправить').expectToBeVisible();
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
                                                describe(
                                                    'Нажимаю на кнпоку "История звонков". Открыта история звонков. ' +
                                                    'Нажимаю на имя контакта.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.button('История звонков').click();

                                                        tester.callsRequest().
                                                            fromFirstWeekDay().
                                                            firstPage().
                                                            receiveResponse();

                                                        tester.marksRequest().receiveResponse();

                                                        tester.table.
                                                            row.
                                                            atIndex(1).
                                                            column.
                                                            withHeader('ФИО контакта').
                                                            link.
                                                            click();

                                                        tester.usersRequest().forContacts().receiveResponse();
                                                        tester.contactRequest().receiveResponse();
                                                    });

                                                    it(
                                                        'Нажимаю на кнопку "Контакты". Отображен список контактов.',
                                                    function() {
                                                        tester.button('Контакты').click();
                                                        tester.contactsRequest().differentNames().receiveResponse();

                                                        tester.contactList.item('Балканска Берислава Силаговна').
                                                            expectToBeVisible();
                                                        tester.contactBar.expectNotToExist();
                                                        tester.phoneField.expectToBeVisible();
                                                    });
                                                    it('Отображен контакт.', function() {
                                                        tester.contactBar.expectTextContentToHaveSubstring(
                                                            'ФИО ' +
                                                            'Бележкова Грета Ервиновна'
                                                        );
                                                    });
                                                });
                                                describe('Нажимаю на кнопку максимизации.', function() {
                                                    beforeEach(function() {
                                                        tester.maximizednessButton.click();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('unmaximize');
                                                    });

                                                    it('Нажимаю на кнопку свернутости. Софтфон свернут.', function() {
                                                        tester.collapsednessToggleButton.click();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('resize').
                                                            expectToBeSentWithArguments({
                                                                width: 340,
                                                                height: 212
                                                            });

                                                        tester.maximizednessButton.expectToBeUnmaximized();
                                                        tester.collapsednessToggleButton.expectToBeCollapsed();

                                                        tester.dialpadButton(1).expectNotToExist();
                                                    });
                                                    it('Софтфон не максимизирован.', function() {
                                                        tester.maximizednessButton.expectToBeUnmaximized();
                                                        tester.collapsednessToggleButton.expectToBeExpanded();

                                                        tester.dialpadButton(1).expectToBeVisible();
                                                    });
                                                });
                                                describe('Нажимаю на кнопку видимости.', function() {
                                                    beforeEach(function() {
                                                        tester.softphone.visibilityButton.click();
                                                    });

                                                    it('Поступил входящий звонок. Софтфон скрыт.', function() {
                                                        tester.incomingCall().receive();
                                                        tester.numaRequest().receiveResponse();
                                                        tester.outCallEvent().activeLeads().receive();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('call-start').
                                                            expectToBeSentWithArguments(false);

                                                        tester.dialpadButton(1).expectNotToExist();
                                                    });
                                                    it('Софтфон скрыт.', function() {
                                                        tester.dialpadButton(1).expectNotToExist();
                                                    });
                                                });
                                                describe('Выхожу из софтфона.', function() {
                                                    beforeEach(function() {
                                                        tester.leftMenu.userName.click();
                                                        tester.statusesList.item('Выход').click();

                                                        tester.userLogoutRequest().receiveResponse();

                                                        tester.employeesWebSocket.finishDisconnecting();
                                                        tester.chatsWebSocket.finishDisconnecting();
                                                        tester.eventsWebSocket.finishDisconnecting();
                                                        tester.authLogoutRequest().receiveResponse();

                                                        tester.registrationRequest().
                                                            desktopSoftphone().
                                                            expired().
                                                            receiveResponse();

                                                        spendTime(2000);
                                                        tester.webrtcWebsocket.finishDisconnecting();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('set-icon').
                                                            expectToBeSentWithArguments('windows, 0');

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('resize').
                                                            expectToBeSentWithArguments({
                                                                width: 300,
                                                                height: 350
                                                            });
                                                    });

                                                    it('Вхожу заново.', function() {
                                                        tester.input.withFieldLabel('Логин').fill('botusharova');
                                                        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                                        tester.button('Войти').click();

                                                        tester.loginRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('resize').
                                                            expectToBeSentWithArguments({
                                                                width: 340,
                                                                height: 568
                                                            });

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('login').
                                                            expectToBeSentWithArguments({
                                                                login: 'botusharova',
                                                                password: '8Gls8h31agwLf5k',
                                                                project: 'comagic',
                                                            });

                                                        tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        let requests = ajax.inAnyOrder();
                                                        
                                                        const authCheckRequest = tester.authCheckRequest().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent(requests);

                                                        const statsRequest = tester.statsRequest().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent(requests);

                                                        const accountRequest = tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent(requests);

                                                        const secondAccountRequest = tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent(requests);

                                                        const thirdAccountRequest = tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            forChats().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent(requests);

                                                        requests.expectToBeSent();
                                                        thirdAccountRequest.receiveResponse();

                                                        tester.employeesWebSocket.connect();

                                                        tester.employeesInitMessage().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent();

                                                        tester.chatsWebSocket.connect();
                                                        
                                                        tester.chatsInitMessage().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent();

                                                        tester.countersRequest().receiveResponse();

                                                        getPackage('electron').ipcRenderer.
                                                            recentlySentMessage().
                                                            expectToBeSentToChannel('set-icon').
                                                            expectToBeSentWithArguments('windows, 150');

                                                        tester.offlineMessageCountersRequest().receiveResponse();
                                                        tester.chatChannelListRequest().receiveResponse();
                                                        tester.siteListRequest().receiveResponse();
                                                        tester.markListRequest().receiveResponse();

                                                        tester.chatListRequest().
                                                            forCurrentEmployee().
                                                            receiveResponse();

                                                        tester.chatListRequest().
                                                            forCurrentEmployee().
                                                            active().
                                                            receiveResponse();

                                                        tester.chatListRequest().
                                                            forCurrentEmployee().
                                                            closed().
                                                            receiveResponse();

                                                        tester.chatChannelTypeListRequest().receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            notProcessed().
                                                            receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            processing().
                                                            receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            processed().
                                                            receiveResponse();

                                                        authCheckRequest.receiveResponse();
                                                        tester.talkOptionsRequest().receiveResponse();
                                                        tester.permissionsRequest().receiveResponse();

                                                        tester.settingsRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.employeeStatusesRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.connectEventsWebSocket(1);
                                                        tester.connectSIPWebSocket(1);

                                                        tester.employeeRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.authenticatedUserRequest().receiveResponse();

                                                        tester.registrationRequest().
                                                            desktopSoftphone().
                                                            receiveResponse();

                                                        tester.allowMediaInput();
                                                        tester.leftMenu.expectToBeVisible();
                                                    });
                                                    it('Нажимаю на поле логина. Отображен список логинов.', function() {
                                                        tester.input.withFieldLabel('Логин').click();
                                                        tester.select.option('botusharova').expectToBeVisible();
                                                    });
                                                });
                                                it('Отображен большой софтфон.', function() {
                                                    tester.button('Чаты').expectNotToBePressed();
                                                    tester.button('Заявки').expectNotToBePressed();
                                                    tester.button('Статистика').expectToBePressed();
                                                    tester.button('История звонков').expectNotToBePressed();
                                                    tester.button('Настройки').expectNotToBePressed();

                                                    tester.dialpadButton(1).expectToBeVisible();

                                                    tester.dialpadVisibilityButton.
                                                        expectToHaveClass('cmg-button-disabled');

                                                    tester.dialpadVisibilityButton.
                                                        expectToHaveClass('cmg-button-pressed');

                                                    tester.collapsednessToggleButton.expectNotToExist();
                                                    tester.callsHistoryButton.expectNotToBePressed();
                                                    tester.callsHistoryButton.indicator.expectNotToExist();
                                                    tester.maximizednessButton.expectToBeMaximized();

                                                    if (localStorage.getItem('isLarge') !== 'true') {
                                                        throw new Error(
                                                            'В локальном хранилище должна быть сохранена ' +
                                                            'максимизация софтфона.'
                                                        );
                                                    }
                                                });
                                                it(
                                                    'Нажимаю на кнопку истории звонков. Открыт раздел истории звонков.',
                                                function() {
                                                    tester.callsHistoryButton.click();

                                                    tester.callsRequest().
                                                        fromFirstWeekDay().
                                                        firstPage().
                                                        receiveResponse();
                                                    
                                                    tester.marksRequest().receiveResponse();

                                                    tester.callsHistoryButton.expectToBePressed();
                                                    tester.chatsButton.expectNotToBePressed();
                                                    tester.settingsButton.expectNotToBePressed();
                                                });
                                                it(
                                                    'Нажимаю на кнопку настроек в нижнем меню. Открыт раздел настроек.',
                                                function() {
                                                    tester.settingsButton.click();
                                                    tester.button('Автозапуск приложения').expectToBeVisible();

                                                    tester.settingsButton.expectToBePressed();
                                                    tester.chatsButton.expectNotToBePressed();
                                                    tester.callsHistoryButton.expectNotToBePressed();
                                                });
                                                it(
                                                    'Получено сообщение о максимизации. Ничего не происходит.',
                                                function() {
                                                    getPackage('electron').ipcRenderer.receiveMessage('maximize');

                                                    tester.maximizednessButton.expectToBeMaximized();
                                                    tester.dialpadButton(1).expectToBeVisible();
                                                });
                                                it(
                                                    'Нажимаю на кнопку "Контакты". Отображена таблица контактов.',
                                                function() {
                                                    tester.button('Контакты').click();
                                                    tester.contactsRequest().differentNames().receiveResponse();

                                                    tester.contactList.
                                                        item('Балканска Берислава Силаговна').
                                                        expectToBeVisible();
                                                });
                                                it(
                                                    'Нажимаю на кнопку аккаунта в меню. Отображена всплывающая панель.',
                                                function() {
                                                    tester.leftMenu.userName.click();

                                                    tester.statusesList.expectTextContentToHaveSubstring(
                                                        'Ганева Стефка ' +
                                                        'Внутренний номер: 9119'
                                                    );
                                                });
                                            });
                                            describe(
                                                'Зафиксирую ширину окна. Нажимаю на кнопку максимизации.',
                                            function() {
                                                beforeEach(function() {
                                                    document.querySelector('.cm-app').style = 'width: 1015px;';
                                                    tester.maximizednessButton.click();

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
                                                    
                                                    const requests = ajax.inAnyOrder();

                                                    const statsRequest = tester.statsRequest().
                                                        expectToBeSent(requests);

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        forChats().
                                                        expectToBeSent(requests);

                                                    const secondAccountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    statsRequest.receiveResponse();
                                                    accountRequest.receiveResponse();
                                                    secondAccountRequest.receiveResponse();

                                                    tester.countersRequest().receiveResponse();

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                                    tester.offlineMessageListRequest().processed().receiveResponse();
                                                });

                                                describe('Скрываю софтфон.', function() {
                                                    beforeEach(function() {
                                                        tester.softphone.visibilityButton.click();
                                                    });

                                                    it(
                                                        'Открываю раздел контаков. Открываю раздел статистики. ' +
                                                        'Показываю софтфон. Отображена кнопка "Показать все статусы".',
                                                    function() {
                                                        tester.button('Контакты').click();
                                                        tester.contactsRequest().differentNames().receiveResponse();

                                                        tester.button('Статистика').click();
                                                        tester.statsRequest().receiveResponse();

                                                        tester.softphone.visibilityButton.click();

                                                        tester.accountRequest().
                                                            operatorWorkplaceAvailable().
                                                            receiveResponse();

                                                        tester.button('Показать все статусы').expectToBeVisible();
                                                    });
                                                    it('Кнопка "Показать все статусы" скрыта.', function() {
                                                        tester.button('Показать все статусы').expectNotToExist();
                                                    });
                                                });
                                                it('Отображена кнопка "Показать все статусы".', function() {
                                                    tester.button('Показать все статусы').expectToBeVisible();
                                                });
                                            });
                                            describe('Открываю историю звонков.', function() {
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

                                                    it(
                                                        'Нажимаю на имя контакта. Открывается страница контакта.',
                                                    function() {
                                                        tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                                                        getPackage('electron').shell.expectExternalUrlToBeOpened(
                                                            'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                                        );
                                                    });
                                                    it('Спиннер скрыт.', function() {
                                                        getPackage('electron-log').expectToContain([
                                                            'Time consumed 1000 ms',

                                                            'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST' +
                                                                '/sup/api/v1/users/me/calls',

                                                            JSON.stringify({
                                                                limit: 100,
                                                                to: '2019-12-19T23:59:59.999+03:00',
                                                                from: '2019-10-19T00:00:00.000+03:00',
                                                                is_strict_date_till:  0,
                                                                search:  ''
                                                            }),

                                                            '{"data":[{"cdr_type":"forward_call",'//...}]}
                                                        ].join("\n\n"));

                                                        tester.spin.expectNotToExist();
                                                    });
                                                });
                                                it('Не удалось получить данные. Спиннер скрыт.', function() {
                                                    callsRequest.serverError().receiveResponse();
                                                    tester.spin.expectNotToExist();

                                                    getPackage('electron-log').expectToContain([
                                                        'Failed; Time consumed 1000 ms',

                                                        'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST' +
                                                            '/sup/api/v1/users/me/calls',

                                                        JSON.stringify({
                                                            limit: 100,
                                                            to: '2019-12-19T23:59:59.999+03:00',
                                                            from: '2019-10-19T00:00:00.000+03:00',
                                                            is_strict_date_till:  0,
                                                            search:  ''
                                                        }),

                                                        '500 Internal Server Error Server got itself in trouble'
                                                    ].join("\n\n"));
                                                });
                                                it('Отображен спиннер.', function() {
                                                    tester.spin.expectToBeVisible();
                                                });
                                            });
                                            describe('Раскрываю список статусов.', function() {
                                                beforeEach(function() {
                                                    tester.userName.click();
                                                });

                                                it(
                                                    'Нажимаю на кнопку "Выход". Вхожу в софтфон заново. Удалось ' +
                                                    'войти. Скрываю приложение. Приходит трансфер от другого ' +
                                                    'сотрудника. Отображено уведомление.',
                                                function() {
                                                    tester.statusesList.item('Выход').click();
                                                    tester.userLogoutRequest().receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 0');
                                                    
                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 300,
                                                            height: 350
                                                        });

                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.chatsWebSocket.finishDisconnecting();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.authLogoutRequest().receiveResponse();

                                                    tester.registrationRequest().
                                                        desktopSoftphone().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.input.withFieldLabel('Логин').fill('botusharova');
                                                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                                    tester.button('Войти').click();

                                                    tester.loginRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 212
                                                        });

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('login').
                                                        expectToBeSentWithArguments({
                                                            login: 'botusharova',
                                                            password: '8Gls8h31agwLf5k',
                                                            project: 'comagic',
                                                        });

                                                    tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.accountRequest().
                                                        forChats().
                                                        operatorWorkplaceAvailable().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.employeesWebSocket.connect();

                                                    tester.employeesInitMessage().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent();

                                                    tester.chatsWebSocket.connect();

                                                    tester.chatsInitMessage().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent();

                                                    const requests = ajax.inAnyOrder();

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent(requests);

                                                    const authCheckRequest = tester.authCheckRequest().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    accountRequest.receiveResponse();
                                                    authCheckRequest.receiveResponse();

                                                    tester.countersRequest().receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 150');

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                                    tester.offlineMessageListRequest().processed().receiveResponse();

                                                    tester.talkOptionsRequest().receiveResponse();

                                                    tester.permissionsRequest().
                                                        allowNumberCapacitySelect().
                                                        allowNumberCapacityUpdate().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.employeeStatusesRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.connectEventsWebSocket(1);
                                                    tester.connectSIPWebSocket(1);

                                                    notificationTester.grantPermission();
                                                    tester.allowMediaInput();

                                                    tester.employeeRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.authenticatedUserRequest().receiveResponse();
                                                    tester.registrationRequest().desktopSoftphone().receiveResponse();

                                                    setFocus(false);
                                                    tester.transferCreatingMessage().receive();

                                                    notificationTester.
                                                        grantPermission().
                                                        recentNotification().
                                                        expectToHaveTitle('Входящий трансфер чата').
                                                        expectToHaveBody('Върбанова Илиана Милановна').
                                                        expectToBeOpened();
                                                });
                                                it('Выбираю статус. Список статусов скрыт.', function() {
                                                    tester.statusesList.item('Нет на месте').click();
                                                    tester.employeeUpdatingRequest().receiveResponse();

                                                    tester.statusesList.expectNotToExist();
                                                });
                                                it('Отображены статусы.', function() {
                                                    tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                                    tester.statusesList.item('Неизвестно').expectNotToExist();

                                                    tester.body.expectTextContentNotToHaveSubstring(
                                                        'karadimova ' +
                                                        'Не беспокоить'
                                                    );
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

                                                    refreshRequest = tester.refreshRequest().expectToBeSent();
                                                });

                                                it(
                                                    'Не удалось обновить токен. Авторизуюсь заново. Пытаюсь поменять ' +
                                                    'статус, но токен истек.',
                                                function() {
                                                    refreshRequest.invalidJwt().receiveResponse();
                                                    tester.userLogoutRequest().invalidJwt().receiveResponse();

                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.chatsWebSocket.finishDisconnecting();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.registrationRequest().
                                                        desktopSoftphone().
                                                        expired().
                                                        receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 0');

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 300,
                                                            height: 350
                                                        });

                                                    tester.authLogoutRequest().expiredToken().receiveResponse();

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

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('login').
                                                        expectToBeSentWithArguments({
                                                            login: 'botusharova',
                                                            password: '8Gls8h31agwLf5k',
                                                            project: 'comagic',
                                                        });

                                                    tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        receiveResponse();

                                                    tester.usersRequest().receiveResponse();
                                                    tester.usersInGroupsRequest().receiveResponse();
                                                    tester.groupsRequest().receiveResponse();

                                                    tester.accountRequest().
                                                        forChats().
                                                        operatorWorkplaceAvailable().
                                                        receiveResponse();

                                                    tester.employeesWebSocket.connect();
                                                    tester.employeesInitMessage().expectToBeSent();

                                                    tester.chatsWebSocket.connect();
                                                    tester.chatsInitMessage().expectToBeSent();

                                                    const requests = ajax.inAnyOrder();

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    const authCheckRequest = tester.authCheckRequest().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    accountRequest.receiveResponse();
                                                    authCheckRequest.receiveResponse();

                                                    tester.countersRequest().receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 150');

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                                    tester.offlineMessageListRequest().processed().receiveResponse();

                                                    tester.talkOptionsRequest().receiveResponse();

                                                    tester.permissionsRequest().
                                                        allowNumberCapacitySelect().
                                                        allowNumberCapacityUpdate().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        allowNumberCapacitySelect().
                                                        receiveResponse();

                                                    tester.employeeStatusesRequest().receiveResponse();

                                                    tester.connectEventsWebSocket(1);
                                                    tester.connectSIPWebSocket(1);

                                                    notificationTester.grantPermission();
                                                    tester.allowMediaInput();

                                                    tester.numberCapacityRequest().receiveResponse();
                                                    tester.employeeRequest().receiveResponse();
                                                    tester.authenticatedUserRequest().receiveResponse();

                                                    tester.registrationRequest().
                                                        desktopSoftphone().
                                                        receiveResponse();

                                                    tester.userName.click();
                                                    tester.statusesList.item('Нет на месте').click();

                                                    tester.employeeUpdatingRequest().
                                                        accessTokenExpired().
                                                        receiveResponse();

                                                    tester.refreshRequest().receiveResponse();
                                                    tester.employeeUpdatingRequest().receiveResponse();
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
                                            describe(
                                                'Ввожу номер телефона. Нажимаю на кнпоку вызова. Поступил входящий ' +
                                                'звонок.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.phoneField.fill('79161234567');
                                                    tester.callStartingButton.click();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

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
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 276
                                                        });
                                                });

                                                it('Нажимаю на кнопку большого размера.', function() {
                                                    tester.maximizednessButton.click();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 632
                                                        });

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('maximize');

                                                    const requests = ajax.inAnyOrder();

                                                    const statsRequest = tester.statsRequest().
                                                        expectToBeSent(requests);

                                                    const accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        forChats().
                                                        expectToBeSent(requests);

                                                    const secondAccountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();
                                                    secondAccountRequest.receiveResponse();

                                                    statsRequest.receiveResponse();
                                                    accountRequest.operatorWorkplaceAvailable().receiveResponse();

                                                    tester.countersRequest().receiveResponse();

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                                    tester.offlineMessageListRequest().processed().receiveResponse();
                                                });
                                                it('Нажимаю на кнопку диалпада. Обновлен размер.', function() {
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
                                            describe('Открываю список номеров.', function() {
                                                beforeEach(function() {
                                                    tester.select.arrow.click();
                                                    tester.numberCapacityRequest().receiveResponse();
                                                });

                                                it('Нажимаю на кнопку сворачивания списка.', function() {
                                                    tester.button('Отменить').click();
                                                    tester.select.popup.expectNotToExist();
                                                });
                                                it('Список вписан в окно.', function() {
                                                    tester.select.popup.expectToHaveTopOffset(4);
                                                    tester.select.popup.expectToHaveHeight(204);

                                                    tester.input.withPlaceholder('Найти').expectToBeVisible();
                                                });
                                            });
                                            describe('Получено обновление.', function() {
                                                beforeEach(function() {
                                                    getPackage('electron').ipcRenderer.
                                                        receiveMessage('update-downloaded');
                                                });

                                                it(
                                                    'Нажимаю на кнопку "Обновить". Устанавливается обновление.',
                                                function() {
                                                    tester.button('Обновить').click();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('quit-and-install');

                                                    tester.alert.expectNotToExist();
                                                });
                                                it(
                                                    'Нажимаю на кнопку закрытия сообщения об обновлении. Сообщение о ' +
                                                    'получении обновления не отображено.',
                                                function() {
                                                    tester.alert.closeButton.click();
                                                    tester.alert.expectNotToExist();
                                                });
                                                it('Отображено сообщение о получении обновления.', function() {
                                                    tester.alert.
                                                        expectTextContentToHaveSubstring('Получено обновление');
                                                });
                                            });
                                            describe('Нажимаю на кнопку развернутости.', function() {
                                                beforeEach(function() {
                                                    tester.collapsednessToggleButton.click();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });

                                                });
                                                
                                                it('Открываю список номеров. Кнопка "Отменить" скрыта.', function() {
                                                    tester.select.arrow.click();
                                                    tester.numberCapacityRequest().receiveResponse();

                                                    tester.select.popup.expectToHaveTopOffset(96);
                                                    tester.select.popup.expectToHaveHeight(331);

                                                    tester.button('Отменить').expectNotToExist();
                                                });
                                                it('Софтфон развернут.', function() {
                                                    tester.maximizednessButton.expectToBeUnmaximized();
                                                    tester.collapsednessToggleButton.expectToBeExpanded();

                                                    tester.dialpadButton(1).expectToBeVisible();
                                                });
                                            });
                                            it(
                                                'Софтфон открыт в другом окне. Раскрываю список статусов. Нажимаю на ' +
                                                'кнопку "Выход". Вхожу в софтфон заново. Удалось войти. Софтфон ' +
                                                'готов к работе.',
                                            function() {
                                                tester.eventsWebSocket.disconnect(4429);
                                                tester.authLogoutRequest().receiveResponse();

                                                tester.registrationRequest().
                                                    desktopSoftphone().
                                                    expired().
                                                    receiveResponse();
                                                
                                                spendTime(2000);
                                                tester.webrtcWebsocket.finishDisconnecting();

                                                tester.userName.click();
                                                tester.statusesList.item('Выход').click();

                                                tester.userLogoutRequest().receiveResponse();

                                                tester.employeesWebSocket.finishDisconnecting();
                                                tester.chatsWebSocket.finishDisconnecting();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 0');

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

                                                tester.loginRequest().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('resize').
                                                    expectToBeSentWithArguments({
                                                        width: 340,
                                                        height: 212
                                                    });

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('login').
                                                    expectToBeSentWithArguments({
                                                        login: 'botusharova',
                                                        password: '8Gls8h31agwLf5k',
                                                        project: 'comagic',
                                                    });

                                                tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.accountRequest().
                                                    forChats().
                                                    operatorWorkplaceAvailable().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.employeesWebSocket.connect();

                                                tester.employeesInitMessage().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent();

                                                tester.chatsWebSocket.connect();

                                                tester.chatsInitMessage().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent();

                                                const requests = ajax.inAnyOrder();

                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent(requests);

                                                const authCheckRequest = tester.authCheckRequest().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                accountRequest.receiveResponse();
                                                authCheckRequest.receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 150');

                                                tester.offlineMessageCountersRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    active().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    closed().
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                tester.talkOptionsRequest().receiveResponse();

                                                tester.permissionsRequest().
                                                    allowNumberCapacitySelect().
                                                    allowNumberCapacityUpdate().
                                                    receiveResponse();

                                                tester.settingsRequest().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.employeeStatusesRequest().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.connectEventsWebSocket(1);
                                                tester.connectSIPWebSocket(1);

                                                notificationTester.grantPermission();
                                                tester.allowMediaInput();

                                                tester.employeeRequest().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.authenticatedUserRequest().receiveResponse();

                                                tester.registrationRequest().desktopSoftphone().receiveResponse();

                                                tester.phoneField.fill('79161234567');
                                                tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                                tester.select.expectNotToExist();
                                            });
                                            it(
                                                'Сотрудник развернул софтфон. Софтфон открыт в большом размере.',
                                            function() {
                                                getPackage('electron').ipcRenderer.receiveMessage('maximize');

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

                                                const requests = ajax.inAnyOrder();

                                                const statsRequest = tester.statsRequest().
                                                    expectToBeSent(requests);

                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                const secondAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                statsRequest.receiveResponse();
                                                accountRequest.receiveResponse();
                                                secondAccountRequest.receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                tester.offlineMessageCountersRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    active().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    closed().
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                tester.maximizednessButton.expectToBeMaximized();
                                                tester.dialpadButton(1).expectToBeVisible();
                                            });
                                            it(
                                                'Нажимаю на кнопку чатов в нижнем меню. Открыт раздел чатов.',
                                            function() {
                                                tester.chatsButton.click();

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
                                                
                                                const requests = ajax.inAnyOrder();
                                                
                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                const chatSettingsRequest = tester.chatSettingsRequest().
                                                    expectToBeSent(requests);
                                                const chatChannelListRequest = tester.chatChannelListRequest().
                                                    expectToBeSent(requests);

                                                const statusListRequest = tester.statusListRequest().
                                                    expectToBeSent(requests);

                                                const listRequest = tester.listRequest().expectToBeSent(requests);
                                                const siteListRequest = tester.siteListRequest().
                                                    expectToBeSent(requests);
                                                const messageTemplateListRequest = tester.messageTemplateListRequest().
                                                    expectToBeSent(requests);
                                                
                                                const secondAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                const thirdAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                accountRequest.receiveResponse();
                                                chatSettingsRequest.receiveResponse();
                                                chatChannelListRequest.receiveResponse();
                                                statusListRequest.receiveResponse();
                                                listRequest.receiveResponse();
                                                siteListRequest.receiveResponse();
                                                messageTemplateListRequest.receiveResponse();
                                                secondAccountRequest.receiveResponse();
                                                thirdAccountRequest.receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                tester.offlineMessageCountersRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();
                                                    
                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    active().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    closed().
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                tester.chatsButton.expectToBePressed();
                                            });
                                            it(
                                                'Нажимаю на кнопку диалпада. Раскрываю список статусов. Отображены ' +
                                                'статусы.',
                                            function() {
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

                                                tester.body.
                                                    expectTextContentNotToHaveSubstring('karadimova Не беспокоить');
                                            });
                                            it(
                                                'Помещаю курсор над иконкой аккаунта. Список статусов не открывается.',
                                            function() {
                                                tester.userName.putMouseOver();
                                                tester.statusesList.item('Не беспокоить').expectNotToExist();
                                            });
                                            it('Нажимаю на цифру. Поле для ввода номера фокусируется.', function() {
                                                utils.pressKey('7');
                                                tester.phoneField.expectToBeFocused();
                                            });
                                            it('Отображен сотфтон.', function() {
                                                tester.phoneField.expectNotToBeFocused();

                                                tester.contactOpeningButton.expectNotToExist();
                                                tester.contactsButton.expectNotToBePressed();
                                                tester.contactsButton.expectToBeEnabled();

                                                tester.bugButton.expectNotToExist();

                                                tester.chatsButton.expectToBeEnabled();
                                                tester.chatsButton.expectNotToBePressed();
                                                tester.chatsButton.indicator.expectToBeVisible();

                                                tester.callsHistoryButton.indicator.expectNotToExist();
                                                tester.callsHistoryButton.expectToBeEnabled();

                                                tester.collapsednessToggleButton.expectToBeCollapsed();
                                                tester.maximizednessButton.expectToBeUnmaximized();

                                                tester.alert.expectNotToExist();

                                                getPackage('electron-log').expectToContain('State changed');

                                                getPackage('electron-log').
                                                    expectToContain('POST $REACT_APP_AUTH_URL?method=login');

                                                getPackage('electron-log').expectToContain(
                                                    '"login":"botusharova",' +
                                                    '"password":"***",' +
                                                    '"project":"comagic"'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    '"jwt":"XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0",' +
                                                    '"refresh":"2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2"'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/api/v1/users/me'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    '"first_name":"Стефка",' +
                                                    '"id":20816'
                                                );

                                                getPackage('electron-log').
                                                    expectToContain('GET $REACT_APP_BASE_URL/chat/channel/list');

                                                getPackage('electron-log').expectToContain(
                                                    '"id":101,' +
                                                    '"is_removed":false,' +
                                                    '"name":"mrDDosT",' +
                                                    '"status":"active",' +
                                                    '"status_reason":"omni_request",' +
                                                    '"type":"telegram"'
                                                );

                                                getPackage('electron-log').
                                                    expectToContain('POST $REACT_APP_BASE_URL?method=get_counters');

                                                getPackage('electron-log').expectToContain(
                                                    '"jsonrpc":"2.0",' +
                                                    '"id":"number",' +
                                                    '"method":"get_counters",' +
                                                    '"params":{}'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    '"new_chat_count":75,' +
                                                    '"active_chat_count":75,' +
                                                    '"active_with_unread_count":75,' +
                                                    '"closed_chat_count":75'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    'wss://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/ws/' +
                                                        'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0 opened'
                                                );

                                                getPackage('electron-log').expectToContain(
                                                    ' wss://webrtc.uiscom.ru message sent:' +
                                                     "\n\n" +
                                                    'REGISTER sip:voip.uiscom.ru SIP/2.0'
                                                );

                                                getPackage('electron-log').
                                                    expectToContain('$REACT_APP_WS_URL message sent:');

                                                getPackage('electron-log').expectToContain(
                                                    '"access_token":"XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0",' +
                                                    '"access_type":"jwt",' +
                                                    '"employee_id":20816,'
                                                );

                                                if (localStorage.getItem('isLarge') === 'true') {
                                                    throw new Error(
                                                        'В локальном хранилище должна быть сохранена максимизация ' +
                                                        'софтфона.'
                                                    );
                                                }
                                            });
                                        });
                                        it('Доступ к микрофону отклонен.', function() {
                                            tester.disallowMediaInput();

                                            getPackage('electron-log').expectToContain(
                                                'Failed to access micrphone: NotAllowedError: Permission denied by ' +
                                                'system'
                                            );
                                        });
                                    });
                                    describe('Получен доступ к микрофону.', function() {
                                        beforeEach(function() {
                                            tester.allowMediaInput();
                                        });

                                        describe('Есть пропущенные звонки.', function() {
                                            beforeEach(function() {
                                                authenticatedUserRequest.newCall().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 151');
                                            });

                                            describe('Выхожу из софтфона. Каунтер сбрасывается.', function() {
                                                beforeEach(function() {
                                                    tester.userName.click();
                                                    tester.statusesList.item('Выход').click();

                                                    tester.userLogoutRequest().receiveResponse();

                                                    tester.chatsWebSocket.finishDisconnecting();
                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.authLogoutRequest().receiveResponse();

                                                    tester.registrationRequest().
                                                        desktopSoftphone().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 0');

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 150');

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

                                                    tester.loginRequest().
                                                        receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 212
                                                        });

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('login').
                                                        expectToBeSentWithArguments({
                                                            login: 'botusharova',
                                                            password: '8Gls8h31agwLf5k',
                                                            project: 'comagic',
                                                        });

                                                    tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        receiveResponse();

                                                    tester.accountRequest().
                                                        forChats().
                                                        operatorWorkplaceAvailable().
                                                        receiveResponse();

                                                    tester.employeesWebSocket.connect();
                                                    tester.employeesInitMessage().expectToBeSent();

                                                    tester.chatsWebSocket.connect();
                                                    tester.chatsInitMessage().expectToBeSent();

                                                    const requests = ajax.inAnyOrder();

                                                    accountRequest = tester.accountRequest().
                                                        operatorWorkplaceAvailable().
                                                        expectToBeSent(requests);

                                                    const authCheckRequest = tester.authCheckRequest().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();
                                                    accountRequest.receiveResponse();

                                                    tester.countersRequest().
                                                        noNewChatsWithUnreadMessages().
                                                        receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 75');

                                                    tester.offlineMessageCountersRequest().receiveResponse();
                                                    tester.chatChannelListRequest().receiveResponse();
                                                    tester.siteListRequest().receiveResponse();
                                                    tester.markListRequest().receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        count(0).
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        count(0).
                                                        closed().
                                                        receiveResponse();

                                                    tester.chatChannelTypeListRequest().receiveResponse();

                                                    tester.offlineMessageListRequest().
                                                        notProcessed().
                                                        receiveResponse();

                                                    tester.offlineMessageListRequest().
                                                        processing().
                                                        receiveResponse();

                                                    tester.offlineMessageListRequest().
                                                        processed().
                                                        receiveResponse();

                                                    authCheckRequest.receiveResponse();
                                                    tester.talkOptionsRequest().receiveResponse();
                                                    tester.permissionsRequest().receiveResponse();
                                                    tester.settingsRequest().receiveResponse();
                                                    tester.employeeStatusesRequest().receiveResponse();

                                                    tester.connectEventsWebSocket(1);
                                                    tester.connectSIPWebSocket(1);

                                                    tester.employeeRequest().receiveResponse();
                                                    tester.authenticatedUserRequest().receiveResponse();

                                                    tester.registrationRequest().desktopSoftphone().receiveResponse();
                                                    tester.allowMediaInput();
                                                });

                                                it(
                                                    'Поступило новое сообщение. Каунтер в иконке поменялся.',
                                                function() {
                                                    tester.newMessage().receive();
                                                    notificationTester.grantPermission();

                                                    tester.chatListRequest().chat().receiveResponse();
                                                    tester.countersRequest().receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 150');
                                                });
                                                it(
                                                    'Поступил входящий звонок. Звонок отклонен. Каунтер в иконке ' +
                                                    'поменялся.',
                                                function() {
                                                    const incomingCall = tester.incomingCall().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

                                                    tester.numaRequest().receiveResponse();
                                                    tester.outCallEvent().activeLeads().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });

                                                    incomingCall.receiveCancel();

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

                                                    tester.callSessionFinish().receive();
                                                    tester.lostCallSessionEvent().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 76');
                                                });
                                            });
                                            describe('Скрываю приложение. Открываю историю звонков.', function() {
                                                beforeEach(function() {
                                                    setDocumentVisible(false);

                                                    tester.callsHistoryButton.click();
                                                    tester.callsRequest().receiveResponse();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });
                                                });

                                                it(
                                                    'Поступил входящий звонок. Звонок отклонен. Поступил еще один ' +
                                                    'входящий звонок. Звонок отклонен. Каунтер обновлен.',
                                                function() {
                                                    let incomingCall = tester.incomingCall().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 212
                                                        });

                                                    tester.numaRequest().receiveResponse();
                                                    tester.outCallEvent().activeLeads().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });

                                                    setDocumentVisible(false);
                                                    incomingCall.receiveCancel();

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

                                                    tester.callSessionFinish().receive();
                                                    tester.lostCallSessionEvent().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 152');

                                                    incomingCall = tester.incomingCall().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('call-start').
                                                        expectToBeSentWithArguments(false);

                                                    tester.numaRequest().receiveResponse();
                                                    tester.outCallEvent().activeLeads().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('resize').
                                                        expectToBeSentWithArguments({
                                                            width: 340,
                                                            height: 568
                                                        });

                                                    incomingCall.receiveCancel();

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

                                                    tester.callSessionFinish().receive();
                                                    tester.lostCallSessionEvent().receive();

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 153');
                                                });
                                                it('Разворачиваюл приложение. Каунтер сбрасывается.', function() {
                                                    setDocumentVisible(true);

                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectToBeSentToChannel('set-icon').
                                                        expectToBeSentWithArguments('windows, 150');
                                                });
                                                it('Каунтер не сбрасывается.', function() {
                                                    getPackage('electron').ipcRenderer.
                                                        recentlySentMessage().
                                                        expectNotToBeSent();
                                                });
                                            });
                                            it('Нажимаю на кнопку максимизации.', function() {
                                                tester.maximizednessButton.click();

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
                                                
                                                const requests = ajax.inAnyOrder();

                                                const statsRequest = tester.statsRequest().
                                                    expectToBeSent(requests);

                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                const secondAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                statsRequest.receiveResponse();
                                                accountRequest.receiveResponse();
                                                secondAccountRequest.receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                tester.offlineMessageCountersRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    active().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    closed().
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                tester.callsHistoryButton.indicator.expectToBeVisible();
                                            });
                                            it(
                                                'Поступил входящий звонок. Скрываю приложение. Звонок отклонен. ' +
                                                'Каунтер в иконке поменялся.',
                                            function() {
                                                const incomingCall = tester.incomingCall().receive();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('call-start').
                                                    expectToBeSentWithArguments(false);

                                                tester.numaRequest().receiveResponse();
                                                tester.outCallEvent().activeLeads().receive();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('resize').
                                                    expectToBeSentWithArguments({
                                                        width: 340,
                                                        height: 568
                                                    });

                                                setDocumentVisible(false);
                                                incomingCall.receiveCancel();

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

                                                tester.callSessionFinish().receive();
                                                tester.lostCallSessionEvent().receive();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 152');

                                                setDocumentVisible(true);
                                            });
                                            it('Открываю историю звонков. Каунтер сбрасывается', function() {
                                                tester.callsHistoryButton.click();
                                                tester.callsRequest().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 150');

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('resize').
                                                    expectToBeSentWithArguments({
                                                        width: 340,
                                                        height: 568
                                                    });
                                            });
                                            it(
                                                'Рядом с кнопкой истории звонков в нижнем тулбаре софтфона ' +
                                                'отображена красная точка.',
                                            function() {
                                                tester.callsHistoryButton.indicator.expectToBeVisible();
                                            });
                                        });
                                        it(
                                            'SIP-линия не зарегистрирована. Раскрываю список статусов. Отображены ' +
                                            'статусы.',
                                        function() {
                                            authenticatedUserRequest.sipIsOffline().receiveResponse();
                                            tester.userName.click();

                                            tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                        });
                                    });
                                });
                                describe('Получен доступ к микрофону.', function() {
                                    beforeEach(function() {
                                        tester.allowMediaInput();
                                    });

                                    describe('Нет чатов в работе с неотвеченным сообщениями.', function() {
                                        beforeEach(function() {
                                            countersRequest.
                                                noActiveChatsWithUnreadMessages().
                                                receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 75');

                                            newChatListRequest.receiveResponse();
                                            activeChatListRequest.count(0).receiveResponse();
                                            closedChatListRequest.receiveResponse();

                                            tester.chatsButton.click();

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

                                            const requests = ajax.inAnyOrder();

                                            const chatSettingsRequest = tester.chatSettingsRequest().
                                                expectToBeSent(requests);

                                            const chatChannelListRequest = tester.chatChannelListRequest().
                                                expectToBeSent(requests);

                                            const statusListRequest = tester.statusListRequest().
                                                expectToBeSent(requests);

                                            const listRequest = tester.listRequest().expectToBeSent(requests),
                                                siteListRequest = tester.siteListRequest().expectToBeSent(requests);

                                            const messageTemplateListRequest = tester.messageTemplateListRequest().
                                                expectToBeSent(requests);

                                            const accountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const secondAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const thirdAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            chatSettingsRequest.receiveResponse();
                                            chatChannelListRequest.receiveResponse();
                                            statusListRequest.receiveResponse();
                                            listRequest.receiveResponse();
                                            siteListRequest.receiveResponse();
                                            messageTemplateListRequest.receiveResponse();
                                            accountRequest.receiveResponse();
                                            secondAccountRequest.receiveResponse();
                                            thirdAccountRequest.receiveResponse();

                                            tester.countersRequest().
                                                noActiveChats().
                                                receiveResponse();

                                            tester.offlineMessageCountersRequest().newMessage().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 76');

                                            tester.chatChannelListRequest().receiveResponse();
                                            tester.siteListRequest().receiveResponse();
                                            tester.markListRequest().receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                active().
                                                count(0).
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                closed().
                                                receiveResponse();

                                            tester.chatChannelTypeListRequest().receiveResponse();

                                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                            tester.offlineMessageListRequest().processing().receiveResponse();
                                            tester.offlineMessageListRequest().processed().receiveResponse();
                                        });

                                        it(
                                            'Открываю вкладку "В работе". Открываю раздел заявок. Открываю раздел ' +
                                            'чатов. Открыта вкладка "Новые".',
                                        function() {
                                            tester.button('В работе').click();

                                            tester.leftMenu.button('Контакты').click();
                                            tester.contactsRequest().differentNames().receiveResponse();

                                            tester.maximizednessButton.click();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('unmaximize');

                                            tester.chatsButton.click();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('maximize');

                                            const requests = ajax.inAnyOrder();

                                            const accountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                expectToBeSent(requests);

                                            const chatSettingsRequest = tester.chatSettingsRequest().
                                                expectToBeSent(requests);

                                            const chatChannelListRequest = tester.chatChannelListRequest().
                                                expectToBeSent(requests);
                                            const statusListRequest = tester.statusListRequest().
                                                expectToBeSent(requests);
                                            const listRequest = tester.listRequest().expectToBeSent(requests);
                                            const siteListRequest = tester.siteListRequest().expectToBeSent(requests);

                                            const messageTemplateListRequest = tester.messageTemplateListRequest().
                                                expectToBeSent(requests);

                                            const secondAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const thirdAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            accountRequest.receiveResponse();
                                            chatSettingsRequest.receiveResponse();
                                            chatChannelListRequest.receiveResponse();
                                            statusListRequest.receiveResponse();
                                            listRequest.receiveResponse();
                                            siteListRequest.receiveResponse();
                                            messageTemplateListRequest.receiveResponse();
                                            secondAccountRequest.receiveResponse();
                                            thirdAccountRequest.receiveResponse();
                                            
                                            tester.countersRequest().
                                                noActiveChatsWithUnreadMessages().
                                                receiveResponse();

                                            tester.offlineMessageCountersRequest().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 75');

                                            tester.chatChannelListRequest().receiveResponse();
                                            tester.siteListRequest().receiveResponse();
                                            tester.markListRequest().receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                active().
                                                count(0).
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                closed().
                                                receiveResponse();

                                            tester.chatChannelTypeListRequest().receiveResponse();

                                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                            tester.offlineMessageListRequest().processing().receiveResponse();
                                            tester.offlineMessageListRequest().processed().receiveResponse();

                                            tester.button('Новые 75').expectToBePressed();
                                            tester.button('В работе').expectNotToBePressed();
                                        });
                                        it('Открыта вкладка "Новые".', function() {
                                            tester.button('Новые 75').expectToBePressed();
                                            tester.button('В работе').expectNotToBePressed();
                                        });
                                    });
                                    describe('Нет новых чатов.', function() {
                                        beforeEach(function() {
                                            countersRequest.
                                                noNewChatsWithUnreadMessages().
                                                receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 75');

                                            newChatListRequest.count(0).receiveResponse();
                                            activeChatListRequest.receiveResponse();
                                            closedChatListRequest.count(0).receiveResponse();

                                            tester.chatsButton.click();

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

                                            const requests = ajax.inAnyOrder();

                                            const chatSettingsRequest = tester.chatSettingsRequest().
                                                expectToBeSent(requests);

                                            const chatChannelListRequest = tester.chatChannelListRequest().
                                                expectToBeSent(requests);

                                            const statusListRequest = tester.statusListRequest().
                                                expectToBeSent(requests);

                                            const listRequest = tester.listRequest().expectToBeSent(requests),
                                                siteListRequest = tester.siteListRequest().expectToBeSent(requests);

                                            const messageTemplateListRequest = tester.messageTemplateListRequest().
                                                expectToBeSent(requests);

                                            const accountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                expectToBeSent(requests);
                                            
                                            const chatAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const secondChatAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const secondClosedChatListRequest = tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                count(0).
                                                closed().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            chatSettingsRequest.receiveResponse();
                                            chatChannelListRequest.receiveResponse();
                                            statusListRequest.receiveResponse();
                                            listRequest.receiveResponse();
                                            siteListRequest.receiveResponse();
                                            messageTemplateListRequest.receiveResponse();
                                            accountRequest.receiveResponse();
                                            chatAccountRequest.receiveResponse();
                                            secondChatAccountRequest.receiveResponse();
                                            secondClosedChatListRequest.receiveResponse();

                                            tester.countersRequest().
                                                noNewChatsWithUnreadMessages().
                                                receiveResponse();

                                            tester.offlineMessageCountersRequest().newMessage().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 76');

                                            tester.chatChannelListRequest().receiveResponse();
                                            tester.siteListRequest().receiveResponse();
                                            tester.markListRequest().receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                count(0).
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                active().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                count(0).
                                                closed().
                                                receiveResponse();

                                            tester.chatChannelTypeListRequest().receiveResponse();

                                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                            tester.offlineMessageListRequest().processing().receiveResponse();
                                            tester.offlineMessageListRequest().processed().receiveResponse();
                                        });

                                        it('Получено новое сообщение. Открыта вкладка "В работе".', function() {
                                            tester.newMessage().receive();
                                            notificationTester.grantPermission();

                                            tester.chatListRequest().chat().receiveResponse();
                                            tester.countersRequest().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 151');

                                            tester.button('Новые 75').expectNotToBePressed();
                                            tester.button('В работе 75').expectToBePressed();
                                        });
                                        it('Открыта вкладка "В работе".', function() {
                                            tester.button('Новые').expectNotToBePressed();
                                            tester.button('В работе 75').expectToBePressed();
                                        });
                                    });
                                    describe('Нет чатов в работе.', function() {
                                        let notification;

                                        beforeEach(function() {
                                            countersRequest.
                                                noNewChatsWithUnreadMessages().
                                                receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 75');

                                            newChatListRequest.receiveResponse();
                                            activeChatListRequest.count(0).receiveResponse();
                                            closedChatListRequest.count(0).receiveResponse();
                                        });

                                        describe(
                                            'Открываю раздел чатов. Скрываю приложение. Приходит новое сообщение.',
                                        function() {
                                            beforeEach(function() {
                                                tester.chatsButton.click();

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

                                                const requests = ajax.inAnyOrder();

                                                const chatAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                const secondChatAccountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    forChats().
                                                    expectToBeSent(requests);

                                                const chatSettingsRequest = tester.chatSettingsRequest().
                                                    expectToBeSent(requests);

                                                const chatChannelListRequest = tester.chatChannelListRequest().
                                                    expectToBeSent(requests);

                                                const statusListRequest = tester.statusListRequest().
                                                    expectToBeSent(requests);

                                                const listRequest = tester.listRequest().
                                                    expectToBeSent(requests);

                                                const siteListRequest = tester.siteListRequest().
                                                    expectToBeSent(requests);

                                                const messageTemplateListRequest = tester.messageTemplateListRequest().
                                                    expectToBeSent(requests);

                                                const activeChatListRequest = tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    active().
                                                    count(0).
                                                    expectToBeSent(requests);

                                                const closedChatListRequest = tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    closed().
                                                    count(0).
                                                    expectToBeSent(requests);

                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                chatSettingsRequest.receiveResponse();
                                                chatChannelListRequest.receiveResponse();
                                                statusListRequest.receiveResponse();
                                                listRequest.receiveResponse();
                                                siteListRequest.receiveResponse();
                                                messageTemplateListRequest.receiveResponse();
                                                accountRequest.receiveResponse();
                                                chatAccountRequest.receiveResponse();
                                                secondChatAccountRequest.receiveResponse();
                                                activeChatListRequest.receiveResponse();
                                                closedChatListRequest.receiveResponse();

                                                tester.countersRequest().
                                                    noNewChatsWithUnreadMessages().
                                                    receiveResponse();

                                                tester.offlineMessageCountersRequest().newMessage().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 76');

                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    active().
                                                    count(0).
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    closed().
                                                    count(0).
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                setFocus(false);
                                                tester.newMessage().receive();

                                                tester.chatListRequest().
                                                    chat().
                                                    receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 151');

                                                notification = notificationTester.
                                                    grantPermission().
                                                    recentNotification();
                                            });

                                            it(
                                                'Нажимаю на уведомление. Открыт чат с новым сообщением. Открытый чат ' +
                                                'отмечен.',
                                            function() {
                                                notification.click();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('show');

                                                tester.visitorCardRequest().receiveResponse();
                                                tester.messageListRequest().receiveResponse();
                                                tester.employeesRequest().receiveResponse();
                                                tester.employeesRequest().receiveResponse();

                                                tester.chatList.item('Привет').expectToBeSelected();
                                                tester.chatList.item('Здравствуй').expectNotToBeSelected();

                                                tester.body.expectTextContentToHaveSubstring(
                                                    '10 февраля 2020 ' +
                                                    
                                                    'Привет ' +
                                                    '12:13 Ответить ' +

                                                    'Здравствуйте ' +
                                                    '12:12'
                                                );

                                                tester.body.expectTextContentToHaveSubstring(
                                                    'Посетитель ' +

                                                    'ФИО ' +
                                                    'Помакова Бисерка Драгановна'
                                                );
                                            });
                                            it('Отображено уведомление.', function() {
                                                notification.
                                                    expectToHaveTitle('Помакова Бисерка Драгановна').
                                                    expectToHaveTag('16479303').
                                                    expectToHaveBody('Я люблю тебя').
                                                    expectToBeOpened();

                                                tester.chatList.item('Привет').expectNotToExist();
                                                tester.chatList.item('Здравствуй').expectNotToExist();

                                                tester.body.expectTextContentNotToHaveSubstring(
                                                    '10 февраля 2020 ' +
                                                    
                                                    'Привет ' +
                                                    '12:13 Ответить ' +

                                                    'Здравствуйте ' +
                                                    '12:12'
                                                );

                                                tester.body.expectTextContentNotToHaveSubstring(
                                                    'Посетитель ' +

                                                    'ФИО ' +
                                                    'Помакова Бисерка Драгановна'
                                                );
                                            });
                                        });
                                        describe('Скрываю приложение. Приходит новое сообщение.', function() {
                                            let notification;

                                            beforeEach(function() {
                                                setFocus(false);
                                                tester.newMessage().receive();

                                                tester.chatListRequest().
                                                    chat().
                                                    receiveResponse();

                                                tester.countersRequest().receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 150');

                                                notification = notificationTester.
                                                    grantPermission().
                                                    recentNotification();
                                            });

                                            it('Нажимаю на уведомление. Открыт чат с новым сообщением.', function() {
                                                notification.click();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('show');

                                                getPackage('electron').ipcRenderer.
                                                    receiveMessage('maximize');

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

                                                tester.visitorCardRequest().receiveResponse();
                                                tester.messageListRequest().receiveResponse();

                                                const requests = ajax.inAnyOrder();

                                                const statsRequest = tester.statsRequest().
                                                    expectToBeSent(requests);

                                                const accountRequest = tester.accountRequest().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                const secondAccountRequest = tester.accountRequest().
                                                    forChats().
                                                    operatorWorkplaceAvailable().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                statsRequest.receiveResponse();
                                                accountRequest.receiveResponse();
                                                secondAccountRequest.receiveResponse();

                                                tester.countersRequest().
                                                    noNewChatsWithUnreadMessages().
                                                    receiveResponse();

                                                getPackage('electron').ipcRenderer.
                                                    recentlySentMessage().
                                                    expectToBeSentToChannel('set-icon').
                                                    expectToBeSentWithArguments('windows, 75');

                                                tester.offlineMessageCountersRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.markListRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    count(0).
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    active().
                                                    count(0).
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    anyScrollFromDate().
                                                    closed().
                                                    count(0).
                                                    receiveResponse();

                                                tester.chatChannelTypeListRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();

                                                spendTime(200);
                                                spendTime(0);
                                                spendTime(0);
                                                spendTime(0);

                                                tester.employeesRequest().receiveResponse();

                                                tester.accountRequest().
                                                    forChats().
                                                    operatorWorkplaceAvailable().
                                                    receiveResponse();

                                                tester.chatSettingsRequest().receiveResponse();
                                                tester.chatChannelListRequest().receiveResponse();
                                                tester.statusListRequest().receiveResponse();
                                                tester.listRequest().receiveResponse();
                                                tester.siteListRequest().receiveResponse();
                                                tester.messageTemplateListRequest().receiveResponse();

                                                tester.chatList.item('Привет').expectToBeSelected();
                                                tester.chatList.item('Здравствуй').expectNotToBeSelected();

                                                tester.body.expectTextContentToHaveSubstring(
                                                    '10 февраля 2020 ' +
                                                    
                                                    'Привет ' +
                                                    '12:13 Ответить ' +

                                                    'Здравствуйте ' +
                                                    '12:12'
                                                );

                                                tester.body.expectTextContentToHaveSubstring(
                                                    'Посетитель ' +

                                                    'ФИО ' +
                                                    'Помакова Бисерка Драгановна'
                                                );
                                            });
                                            it('Отображено уведомление.', function() {
                                                notification.
                                                    expectToHaveTitle('Помакова Бисерка Драгановна').
                                                    expectToHaveTag('16479303').
                                                    expectToHaveBody('Я люблю тебя').
                                                    expectToBeOpened();
                                            });
                                        });
                                    });
                                    describe('Нет непрочитанных сообщений.', function() {
                                        beforeEach(function() {
                                            countersRequest.noUnreadMessages().receiveResponse();
                                            authenticatedUserRequest.receiveResponse();

                                            newChatListRequest.noUnreadMessages().count(0).receiveResponse();
                                            activeChatListRequest.noUnreadMessages().count(4).receiveResponse();
                                            closedChatListRequest.noUnreadMessages().count(2).receiveResponse();
                                        });

                                        it('Нажимаю на кнопку максимизаии.', function() {
                                            tester.maximizednessButton.click();

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
                                            
                                            const requests = ajax.inAnyOrder();

                                            const statsRequest = tester.statsRequest().
                                                expectToBeSent(requests);

                                            const accountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                expectToBeSent(requests);

                                            const secondAccountRequest = tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            statsRequest.receiveResponse();
                                            accountRequest.receiveResponse();
                                            secondAccountRequest.receiveResponse();

                                            tester.countersRequest().noUnreadMessages().receiveResponse();

                                            tester.offlineMessageCountersRequest().receiveResponse();
                                            tester.chatChannelListRequest().receiveResponse();
                                            tester.siteListRequest().receiveResponse();
                                            tester.markListRequest().receiveResponse();
                                                
                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                active().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                anyScrollFromDate().
                                                closed().
                                                receiveResponse();

                                            tester.chatChannelTypeListRequest().receiveResponse();

                                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                            tester.offlineMessageListRequest().processing().receiveResponse();
                                            tester.offlineMessageListRequest().processed().receiveResponse();

                                            tester.button('Заявки').click();

                                            tester.accountRequest().
                                                operatorWorkplaceAvailable().
                                                forChats().
                                                receiveResponse();

                                            tester.chatSettingsRequest().receiveResponse();
                                            tester.chatChannelListRequest().receiveResponse();
                                            tester.statusListRequest().receiveResponse();
                                            tester.listRequest().receiveResponse();
                                            tester.siteListRequest().receiveResponse();
                                            tester.messageTemplateListRequest().receiveResponse();

                                            tester.button('В работе').click();

                                            tester.newOfflineMessage().receive();
                                            notificationTester.grantPermission();
                                            tester.offlineMessageCountersRequest().newMessage().receiveResponse();
                                            tester.offlineMessageCountersRequest().newMessage().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 1');

                                            tester.chatsButton.click();

                                            tester.button('Новые 1').expectToBePressed();
                                            tester.button('В работе').expectNotToBePressed();
                                        });
                                        it(
                                            'Получено новое сообщение. Отображено индикатор непрочитанных сообщений.',
                                        function() {
                                            tester.newMessage().receive();
                                            tester.chatListRequest().chat().receiveResponse();
                                            tester.countersRequest().receiveResponse();

                                            getPackage('electron').ipcRenderer.
                                                recentlySentMessage().
                                                expectToBeSentToChannel('set-icon').
                                                expectToBeSentWithArguments('windows, 150');
                                        });
                                        it('Индикатор непрочитанных сообщений скрыт.', function() {
                                            tester.chatsButton.indicator.expectNotToExist();
                                        });
                                    });
                                });
                            });
                            describe('Получены данные сотрудника и доступ к микрофону.', function() {
                                beforeEach(function() {
                                    tester.allowMediaInput();
                                    authenticatedUserRequest.receiveResponse();
                                });

                                describe('Есть непрочитанные заявки.', function() {
                                    beforeEach(function() {
                                        offlineMessageCountersRequest.newMessage().receiveResponse();
                                        countersRequest.noUnreadMessages().receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('set-icon').
                                            expectToBeSentWithArguments('windows, 1');

                                        newChatListRequest.noUnreadMessages().count(0).receiveResponse();
                                        activeChatListRequest.noUnreadMessages().count(4).receiveResponse();
                                        closedChatListRequest.noUnreadMessages().count(2).receiveResponse();
                                    });

                                    it('Отображено количество непрочитанных заявок.', function() {
                                        tester.maximizednessButton.click();

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
                                        
                                        const requests = ajax.inAnyOrder();

                                        const statsRequest = tester.statsRequest().
                                            expectToBeSent(requests);

                                        const accountRequest = tester.accountRequest().
                                            operatorWorkplaceAvailable().
                                            forChats().
                                            expectToBeSent(requests);

                                        const secondAccountRequest = tester.accountRequest().
                                            operatorWorkplaceAvailable().
                                            expectToBeSent(requests);

                                        requests.expectToBeSent();

                                        statsRequest.receiveResponse();
                                        accountRequest.receiveResponse();
                                        secondAccountRequest.receiveResponse();

                                        tester.countersRequest().noUnreadMessages().receiveResponse();

                                        tester.offlineMessageCountersRequest().newMessage().receiveResponse();
                                        tester.chatChannelListRequest().receiveResponse();
                                        tester.siteListRequest().receiveResponse();
                                        tester.markListRequest().receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            active().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            closed().
                                            receiveResponse();

                                        tester.chatChannelTypeListRequest().receiveResponse();

                                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                        tester.offlineMessageListRequest().processing().receiveResponse();
                                        tester.offlineMessageListRequest().processed().receiveResponse();

                                        tester.button('Заявки').expectToBeVisible();
                                    });
                                    it('Нажимаю на кнопку чатов. Выбран пункт "Заявки" левого меню.', function() {
                                        tester.chatsButton.click();

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

                                        const requests = ajax.inAnyOrder();
                                        
                                        const accountRequest = tester.accountRequest().
                                            operatorWorkplaceAvailable().
                                            expectToBeSent(requests);

                                        const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                                        const chatChannelListRequest = tester.chatChannelListRequest().
                                            expectToBeSent(requests);
                                        const statusListRequest = tester.statusListRequest().expectToBeSent(requests);
                                        const listRequest = tester.listRequest().expectToBeSent(requests);
                                        const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                                        const messageTemplateListRequest = tester.messageTemplateListRequest().
                                            expectToBeSent(requests);
                                        
                                        const secondAccountRequest = tester.accountRequest().
                                            operatorWorkplaceAvailable().
                                            forChats().
                                            expectToBeSent(requests);

                                        const thirdAccountRequest = tester.accountRequest().
                                            operatorWorkplaceAvailable().
                                            forChats().
                                            expectToBeSent(requests);

                                        requests.expectToBeSent();

                                        accountRequest.receiveResponse();
                                        chatSettingsRequest.receiveResponse();
                                        chatChannelListRequest.receiveResponse();
                                        statusListRequest.receiveResponse();
                                        listRequest.receiveResponse();
                                        siteListRequest.receiveResponse();
                                        messageTemplateListRequest.receiveResponse();
                                        secondAccountRequest.receiveResponse();
                                        thirdAccountRequest.receiveResponse();

                                        tester.countersRequest().noUnreadMessages().receiveResponse();

                                        tester.offlineMessageCountersRequest().newMessage().receiveResponse();
                                        tester.chatChannelListRequest().receiveResponse();
                                        tester.siteListRequest().receiveResponse();
                                        tester.markListRequest().receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            active().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            anyScrollFromDate().
                                            closed().
                                            receiveResponse();

                                        tester.chatChannelTypeListRequest().receiveResponse();

                                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                        tester.offlineMessageListRequest().processing().receiveResponse();
                                        tester.offlineMessageListRequest().processed().receiveResponse();

                                        tester.button('Заявки').expectToBePressed();
                                        tester.button('Чаты').expectNotToBePressed();
                                    });
                                    it('Отображен индикатор непрочитанных сообщений.', function() {
                                        tester.chatsButton.indicator.expectToBeVisible();
                                    });
                                });
                                it(
                                    'Поступил входящий звонок. Звонок отклонен. Каунтер в иконке поменялся. Получено ' +
                                    'новое сообщение в чате. Каунтер в иконке поменялся.',
                                function() {
                                    offlineMessageCountersRequest.receiveResponse();
                                    countersRequest.fewUnreadMessages().receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 8');

                                    newChatListRequest.
                                        count(5).
                                        fewUnreadMessages().
                                        receiveResponse();

                                    activeChatListRequest.
                                        count(4).
                                        fewUnreadMessages().
                                        receiveResponse();
                                    
                                    closedChatListRequest.
                                        count(2).
                                        fewUnreadMessages().
                                        receiveResponse();

                                    const incomingCall = tester.incomingCall().receive();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('call-start').
                                        expectToBeSentWithArguments(false);

                                    tester.numaRequest().receiveResponse();
                                    tester.outCallEvent().activeLeads().receive();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 340,
                                            height: 568
                                        });

                                    incomingCall.receiveCancel();

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

                                    tester.callSessionFinish().receive();
                                    tester.lostCallSessionEvent().receive();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 9');

                                    tester.newMessage().receive();

                                    tester.chatListRequest().
                                        chat().
                                        receiveResponse();

                                    tester.countersRequest().
                                        newMessage().
                                        fewUnreadMessages().
                                        receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 10');
                                });
                            });
                        });
                        it('Не удалось авторизоваться в софтфоне.', function() {
                            authCheckRequest.invalidToken().receiveResponse();

                            const requests = ajax.inAnyOrder(),
                                userLogoutRequest = tester.userLogoutRequest().expectToBeSent(requests),
                                authLogoutRequest = tester.authLogoutRequest().invalidToken().expectToBeSent(requests);

                            requests.expectToBeSent();

                            userLogoutRequest.receiveResponse();
                            authLogoutRequest.receiveResponse();

                            tester.employeesWebSocket.finishDisconnecting();

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
                    describe('Раздел контактов недоступен.', function() {
                        beforeEach(function() {
                            accountRequest.
                                addressBookReadingUnavailable().
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            const requests = ajax.inAnyOrder();
                            const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                            const secondAccountRequest = tester.accountRequest().
                                addressBookReadingUnavailable().
                                operatorWorkplaceAvailable().
                                forChats().
                                expectToBeSent(requests);

                            const thirdAccountRequest = tester.accountRequest().
                                addressBookReadingUnavailable().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();
                            thirdAccountRequest.receiveResponse();
                            authCheckRequest.receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();

                            tester.permissionsRequest().
                                allowNumberCapacitySelect().
                                allowNumberCapacityUpdate().
                                receiveResponse();

                            tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                            tester.employeeStatusesRequest().receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            notificationTester.grantPermission();
                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.employeeRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().receiveResponse();

                            secondAccountRequest.receiveResponse();

                            tester.employeesWebSocket.connect();
                            tester.employeesInitMessage().expectToBeSent();

                            tester.chatsWebSocket.connect();
                            tester.chatsInitMessage().expectToBeSent();

                            tester.countersRequest().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('set-icon').
                                expectToBeSentWithArguments('windows, 150');

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.chatListRequest().forCurrentEmployee().receiveResponse();
                            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();
                        });

                        it('Нажимаю на кнопку контактов в верхнем тулбаре. Ничего не происходит..', function() {
                            tester.contactsButton.click();
                        });
                        it('Кнопка контактов в верхнем меню заблокирована.', function() {
                            tester.contactsButton.expectToBeDisabled();
                        });
                    });
                    describe('Софтфон недоступен.', function() {
                        beforeEach(function() {
                            accountRequest.softphoneUnavailable();
                        });

                        describe('Чаты доступны.', function() {
                            beforeEach(function() {
                                accountRequest.
                                    operatorWorkplaceAvailable().
                                    receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('maximize');

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 1150,
                                        height: 630,
                                    });

                                tester.accountRequest().
                                    forChats().
                                    softphoneUnavailable().
                                    operatorWorkplaceAvailable().
                                    receiveResponse();

                                tester.employeesWebSocket.connect();
                                tester.employeesInitMessage().expectToBeSent();

                                tester.chatsWebSocket.connect();
                                tester.chatsInitMessage().expectToBeSent();

                                const requests = ajax.inAnyOrder();

                                accountRequest = tester.accountRequest().
                                    forChats().
                                    softphoneUnavailable().
                                    operatorWorkplaceAvailable().
                                    expectToBeSent(requests);

                                secondAccountRequest = tester.accountRequest().
                                    forChats().
                                    softphoneUnavailable().
                                    operatorWorkplaceAvailable().
                                    expectToBeSent(requests);

                                const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                                const statusListRequest = tester.statusListRequest().expectToBeSent(requests);
                                const listRequest = tester.listRequest().expectToBeSent(requests);
                                const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                                const messageTemplateListRequest = tester.messageTemplateListRequest().
                                    expectToBeSent(requests);
                                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);

                                requests.expectToBeSent();

                                accountRequest.receiveResponse()
                                secondAccountRequest.receiveResponse();
                                chatChannelListRequest.receiveResponse();
                                statusListRequest.receiveResponse();
                                listRequest.receiveResponse();
                                siteListRequest.receiveResponse();
                                messageTemplateListRequest.receiveResponse();
                                chatSettingsRequest.receiveResponse();

                                tester.countersRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('set-icon').
                                    expectToBeSentWithArguments('windows, 150');

                                tester.offlineMessageCountersRequest().receiveResponse();
                                tester.chatChannelListRequest().receiveResponse();
                                tester.siteListRequest().receiveResponse();
                                tester.markListRequest().receiveResponse();

                                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                                tester.chatListRequest().forCurrentEmployee().count(0).active().receiveResponse();
                                tester.chatListRequest().forCurrentEmployee().count(0).closed().receiveResponse();

                                tester.chatChannelTypeListRequest().receiveResponse();

                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                tester.offlineMessageListRequest().processing().receiveResponse();
                                tester.offlineMessageListRequest().processed().receiveResponse();
                            });

                            describe('Нажимаю на кнопку аккаунта.', function() {
                                beforeEach(function() {
                                    tester.leftMenu.userName.click();
                                });

                                describe('Нажимаю на кнопку выхода. Вхожу заново.', function() {
                                    let chatListRequest;

                                    beforeEach(function() {
                                        tester.statusesList.item('Выход').click();
                                        tester.userLogoutRequest().receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('set-icon').
                                            expectToBeSentWithArguments('windows, 0');

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('resize').
                                            expectToBeSentWithArguments({
                                                width: 300,
                                                height: 350,
                                            });

                                        tester.chatsWebSocket.finishDisconnecting();
                                        tester.employeesWebSocket.finishDisconnecting();

                                        tester.input.withFieldLabel('Логин').fill('botusharova');
                                        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                        tester.button('Войти').click();
                                        tester.loginRequest().receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('resize').
                                            expectToBeSentWithArguments({
                                                width: 1150,
                                                height: 630,
                                            });

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('login').
                                            expectToBeSentWithArguments({
                                                login: 'botusharova',
                                                password: '8Gls8h31agwLf5k',
                                                project: 'comagic',
                                            });

                                        tester.accountRequest().
                                            softphoneUnavailable().
                                            operatorWorkplaceAvailable().
                                            receiveResponse();

                                        tester.accountRequest().
                                            forChats().
                                            softphoneUnavailable().
                                            operatorWorkplaceAvailable().
                                            receiveResponse();

                                        tester.employeesWebSocket.connect();
                                        tester.employeesInitMessage().expectToBeSent();

                                        tester.chatsWebSocket.connect();
                                        tester.chatsInitMessage().expectToBeSent();

                                        tester.accountRequest().
                                            forChats().
                                            softphoneUnavailable().
                                            operatorWorkplaceAvailable().
                                            receiveResponse();

                                        tester.accountRequest().
                                            forChats().
                                            softphoneUnavailable().
                                            operatorWorkplaceAvailable().
                                            receiveResponse();

                                        tester.chatSettingsRequest().receiveResponse();
                                        tester.chatChannelListRequest().receiveResponse();
                                        tester.statusListRequest().receiveResponse();
                                        tester.listRequest().receiveResponse();
                                        tester.siteListRequest().receiveResponse();
                                        tester.messageTemplateListRequest().receiveResponse();

                                        tester.countersRequest().receiveResponse();

                                        getPackage('electron').ipcRenderer.
                                            recentlySentMessage().
                                            expectToBeSentToChannel('set-icon').
                                            expectToBeSentWithArguments('windows, 150');

                                        tester.offlineMessageCountersRequest().receiveResponse();
                                        tester.chatChannelListRequest().receiveResponse();
                                        tester.siteListRequest().receiveResponse();
                                        tester.markListRequest().receiveResponse();

                                        chatListRequest = tester.chatListRequest().
                                            forCurrentEmployee().
                                            expectToBeSent();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            count(0).
                                            active().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            forCurrentEmployee().
                                            count(0).
                                            closed().
                                            receiveResponse();

                                        tester.chatChannelTypeListRequest().receiveResponse();

                                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                        tester.offlineMessageListRequest().processing().receiveResponse();
                                        tester.offlineMessageListRequest().processed().receiveResponse();
                                    });

                                    it('Есть только один новый чат.', function() {
                                        chatListRequest.count(1).receiveResponse();

                                        tester.chatList.item('Сообщение #1').expectToBeVisible();
                                        tester.chatList.item('Сообщение #2').expectNotToExist();
                                    });
                                    it('Есть много новых чатов.', function() {
                                        chatListRequest.receiveResponse();

                                        setFocus(false);
                                        tester.newMessage().receive();

                                        tester.chatListRequest().
                                            chat().
                                            receiveResponse();

                                        tester.countersRequest().receiveResponse();

                                        notificationTester.
                                            grantPermission().
                                            recentNotification().
                                            expectToHaveTitle('Помакова Бисерка Драгановна').
                                            expectToHaveTag('16479303').
                                            expectToHaveBody('Я люблю тебя').
                                            expectToBeOpened();
                                    });
                                });
                                it('Отображено имя сотрудника.', function() {
                                    tester.body.expectTextContentToHaveSubstring('karadimova Выход');
                                });
                            });
                            describe('Открываю раздел контактов.', function() {
                                beforeEach(function() {
                                    tester.button('Контакты').click();
                                    tester.contactsRequest().differentNames().receiveResponse();

                                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                                    const requests = ajax.inAnyOrder();

                                    contactCommunicationsRequest = tester.
                                        contactCommunicationsRequest().
                                        secondEarlier().
                                        expectToBeSent(requests);

                                    contactRequest = tester.contactRequest().expectToBeSent(requests);
                                    const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                                    requests.expectToBeSent();

                                    usersRequest.receiveResponse();
                                    contactRequest.receiveResponse();
                                    contactCommunicationsRequest.receiveResponse();
                                });

                                it(
                                    'Получено обновление. Отображено уведомление о том, что обновление получено.',
                                function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('update-downloaded');
                                    tester.alert.expectTextContentToHaveSubstring('Получено обновление');
                                });
                                it(
                                    'Скрываю приложение. Приходит новое сообщение. Отображено уведомление о новом ' +
                                    'сообщении.',
                                function() {
                                    setFocus(false);
                                    tester.newMessage().receive();

                                    tester.chatListRequest().
                                        chat().
                                        receiveResponse();

                                    tester.countersRequest().receiveResponse();

                                    notificationTester.
                                        grantPermission().
                                        recentNotification().
                                        expectToHaveTitle('Помакова Бисерка Драгановна').
                                        expectToHaveTag('16479303').
                                        expectToHaveBody('Я люблю тебя').
                                        expectToBeOpened();
                                });
                            });
                            describe('Пользователь свернул приложение.', function() {
                                beforeEach(function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('unmaximize');

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('unmaximize');
                                });

                                it('Разлогиниваюсь и вхожу заново. Софтфон доступен.', function() {
                                    tester.leftMenu.userName.click();
                                    tester.statusesList.item('Выход').click();

                                    tester.userLogoutRequest().receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 0');

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 300,
                                            height: 350,
                                        });

                                    tester.chatsWebSocket.finishDisconnecting();
                                    tester.employeesWebSocket.finishDisconnecting();

                                    tester.input.withFieldLabel('Логин').fill('botusharova');
                                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                    tester.button('Войти').click();
                                    tester.loginRequest().receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 1150,
                                            height: 630,
                                        });

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('login').
                                        expectToBeSentWithArguments({
                                            login: 'botusharova',
                                            password: '8Gls8h31agwLf5k',
                                            project: 'comagic',
                                        });

                                    tester.accountRequest().
                                        operatorWorkplaceAvailable().
                                        receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 340,
                                            height: 568
                                        });

                                    const requests = ajax.inAnyOrder();

                                    const accountRequest = tester.accountRequest().
                                        operatorWorkplaceAvailable().
                                        expectToBeSent(requests);

                                    const secondAccountRequest = tester.accountRequest().
                                        forChats().
                                        operatorWorkplaceAvailable().
                                        expectToBeSent(requests);

                                    const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                                    requests.expectToBeSent();

                                    accountRequest.receiveResponse();
                                    secondAccountRequest.receiveResponse();

                                    tester.employeesWebSocket.connect();
                                    tester.employeesInitMessage().expectToBeSent();

                                    tester.chatsWebSocket.connect();
                                    tester.chatsInitMessage().expectToBeSent();

                                    tester.countersRequest().receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 150');

                                    tester.offlineMessageCountersRequest().receiveResponse();
                                    tester.chatChannelListRequest().receiveResponse();
                                    tester.siteListRequest().receiveResponse();
                                    tester.markListRequest().receiveResponse();

                                    tester.chatListRequest().forCurrentEmployee().receiveResponse();
                                    tester.chatListRequest().forCurrentEmployee().count(0).active().receiveResponse();
                                    tester.chatListRequest().forCurrentEmployee().count(0).closed().receiveResponse();

                                    tester.chatChannelTypeListRequest().receiveResponse();

                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                    tester.offlineMessageListRequest().processed().receiveResponse();

                                    authCheckRequest.receiveResponse();
                                    tester.talkOptionsRequest().receiveResponse();

                                    tester.permissionsRequest().
                                        allowNumberCapacitySelect().
                                        allowNumberCapacityUpdate().
                                        receiveResponse();

                                    tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                                    tester.employeeStatusesRequest().receiveResponse();

                                    tester.connectEventsWebSocket();
                                    tester.connectSIPWebSocket();

                                    notificationTester.grantPermission();
                                    tester.allowMediaInput();

                                    tester.numberCapacityRequest().receiveResponse();
                                    tester.employeeRequest().receiveResponse();
                                    tester.authenticatedUserRequest().receiveResponse();
                                    tester.registrationRequest().desktopSoftphone().receiveResponse();

                                    tester.chatList.expectNotToExist();
                                });
                                it('Отображен раздел чатов.', function() {
                                    tester.chatList.expectToBeVisible();
                                });
                            });
                            it(
                                'Скрываю приложение. Приходит новое сообщение. Отображено уведомление о новом ' +
                                'сообщении.',
                            function() {
                                setFocus(false);
                                tester.newMessage().receive();

                                tester.chatListRequest().
                                    chat().
                                    receiveResponse();

                                tester.countersRequest().receiveResponse();

                                notificationTester.
                                    grantPermission().
                                    recentNotification().
                                    expectToHaveTitle('Помакова Бисерка Драгановна').
                                    expectToHaveTag('16479303').
                                    expectToHaveBody('Я люблю тебя').
                                    expectToBeOpened();
                            });
                            it(
                                'Получено обновление. Отображено уведомление о том, что обновление получено.',
                            function() {
                                getPackage('electron').ipcRenderer.receiveMessage('update-downloaded');
                                tester.alert.expectTextContentToHaveSubstring('Получено обновление');
                            });
                            it('Отображен раздел чатов.', function() {
                                tester.button('Настройки').expectNotToExist();
                                tester.chatList.expectToBeVisible();
                            });
                        });
                        describe('Чаты недоступны.', function() {
                            beforeEach(function() {
                                accountRequest.receiveResponse();
                                tester.userLogoutRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 300,
                                        height: 350
                                    });
                            });

                            describe('Вхожу РМО.', function() {
                                let loginRequest;

                                beforeEach(function() {
                                    tester.input.withFieldLabel('Логин').fill('botusharova');
                                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                    tester.button('Войти').click();
                                    loginRequest = tester.loginRequest().expectToBeSent();
                                });

                                it('Пароль правильный. Выхожу из РМО. Сообщение об ошибке не отображено.', function() {
                                    loginRequest.receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 340,
                                            height: 212
                                        });

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('login').
                                        expectToBeSentWithArguments({
                                            login: 'botusharova',
                                            password: '8Gls8h31agwLf5k',
                                            project: 'comagic',
                                        });

                                    tester.accountRequest().
                                        softphoneUnavailable().
                                        operatorWorkplaceAvailable().
                                        receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('maximize');

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 1150,
                                            height: 630,
                                        });

                                    tester.accountRequest().
                                        forChats().
                                        softphoneUnavailable().
                                        operatorWorkplaceAvailable().
                                        receiveResponse();

                                    tester.employeesWebSocket.connect();
                                    tester.employeesInitMessage().expectToBeSent();

                                    tester.chatsWebSocket.connect();
                                    tester.chatsInitMessage().expectToBeSent();

                                    tester.accountRequest().
                                        forChats().
                                        softphoneUnavailable().
                                        operatorWorkplaceAvailable().
                                        receiveResponse();

                                    const requests = ajax.inAnyOrder();

                                    const chatSettingsRequest = tester.chatSettingsRequest().
                                        expectToBeSent(requests);

                                    const chatChannelListRequest = tester.chatChannelListRequest().
                                        expectToBeSent(requests);

                                    const statusListRequest = tester.statusListRequest().
                                        expectToBeSent(requests);

                                    const listRequest = tester.listRequest().
                                        expectToBeSent(requests);

                                    const siteListRequest = tester.siteListRequest().
                                        expectToBeSent(requests);

                                    const messageTemplateListRequest = tester.messageTemplateListRequest().
                                        expectToBeSent(requests);

                                    const accountRequest = tester.accountRequest().
                                        forChats().
                                        softphoneUnavailable().
                                        operatorWorkplaceAvailable().
                                        expectToBeSent(requests);

                                    requests.expectToBeSent();

                                    chatSettingsRequest.receiveResponse();
                                    chatChannelListRequest.receiveResponse();
                                    statusListRequest.receiveResponse();
                                    listRequest.receiveResponse();
                                    siteListRequest.receiveResponse();
                                    messageTemplateListRequest.receiveResponse();
                                    accountRequest.receiveResponse();

                                    tester.countersRequest().receiveResponse();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 150');

                                    tester.offlineMessageCountersRequest().receiveResponse();
                                    tester.chatChannelListRequest().receiveResponse();
                                    tester.siteListRequest().receiveResponse();
                                    tester.markListRequest().receiveResponse();

                                    tester.chatListRequest().forCurrentEmployee().receiveResponse();
                                    tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                                    tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                                    tester.chatChannelTypeListRequest().receiveResponse();

                                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                    tester.offlineMessageListRequest().processing().receiveResponse();
                                    tester.offlineMessageListRequest().processed().receiveResponse();
                                        
                                    tester.leftMenu.userName.click();
                                    tester.statusesList.item('Выход').click();

                                    tester.userLogoutRequest().receiveResponse();

                                    tester.chatsWebSocket.finishDisconnecting();
                                    tester.employeesWebSocket.finishDisconnecting();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('set-icon').
                                        expectToBeSentWithArguments('windows, 0');

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('resize').
                                        expectToBeSentWithArguments({
                                            width: 300,
                                            height: 350
                                        });

                                    tester.body.
                                        expectTextContentNotToHaveSubstring('Нет доступа ни к чатам, ни к софтфону');
                                });
                                it(
                                    'Пароль неправильный. Отображено сообщение о том, что введен неправильный пароль.',
                                function() {
                                    loginRequest.failure().receiveResponse();
                                    tester.body.expectTextContentToHaveSubstring('Login or password is wrong');
                                });
                            });
                            it(
                                'Отображена форма аутентификации. Отображено сообщение об отсутствии доступа.',
                            function() {
                                tester.button('Войти').expectToBeVisible();
                                tester.body.expectTextContentToHaveSubstring('Нет доступа к рабочему месту');
                            });
                        });
                    });
                    describe('Используется английский язык.', function() {
                        beforeEach(function() {
                            accountRequest.en().operatorWorkplaceAvailable().receiveResponse();

                            const requests = ajax.inAnyOrder();
                            const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                            const secondAccountRequest = tester.accountRequest().
                                en().
                                operatorWorkplaceAvailable().
                                forChats().
                                expectToBeSent(requests);

                            const thirdAccountRequest = tester.accountRequest().
                                en().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();
                            thirdAccountRequest.receiveResponse();
                            authCheckRequest.receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();

                            tester.permissionsRequest().
                                allowNumberCapacitySelect().
                                allowNumberCapacityUpdate().
                                receiveResponse();

                            tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                            tester.employeeStatusesRequest().receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            notificationTester.grantPermission();
                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.employeeRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().receiveResponse();

                            secondAccountRequest.receiveResponse();

                            tester.employeesWebSocket.connect();
                            tester.employeesInitMessage().expectToBeSent();

                            tester.chatsWebSocket.connect();
                            tester.chatsInitMessage().expectToBeSent();

                            tester.countersRequest().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('set-icon').
                                expectToBeSentWithArguments('windows, 150');

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.chatListRequest().forCurrentEmployee().receiveResponse();
                            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();
                        });

                        it('Разворачиваю приложение. Открываю список статусов.', function() {
                            tester.maximizednessButton.click();

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
                            
                            const requests = ajax.inAnyOrder();

                            const statsRequest = tester.statsRequest().
                                expectToBeSent(requests);

                            const accountRequest = tester.accountRequest().
                                operatorWorkplaceAvailable().
                                en().
                                forChats().
                                expectToBeSent(requests);

                            const secondAccountRequest = tester.accountRequest().
                                operatorWorkplaceAvailable().
                                en().
                                expectToBeSent(requests);

                            requests.expectToBeSent();

                            statsRequest.receiveResponse();
                            accountRequest.receiveResponse();
                            secondAccountRequest.receiveResponse();

                            tester.countersRequest().receiveResponse();

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                active().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                closed().
                                receiveResponse();

                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();

                            tester.leftMenu.userName.click();

                            tester.statusesList.item('Выход').expectNotToExist();
                            tester.statusesList.item('Log out').expectToBeVisible();

                            tester.statusesList.expectTextContentNotToHaveSubstring('Статусы');
                            tester.statusesList.expectTextContentToHaveSubstring('Status');
                        });
                        it('Открываю список номеров. Плейсхолдер поля поиска локализован.', function() {
                            tester.select.arrow.click();
                            tester.numberCapacityRequest().receiveResponse();
                            
                            tester.input.withPlaceholder('Search').expectToBeVisible();
                        });
                    });
                    it('Пользователь является менеджером. Разделы софтфона доступны.', function() {
                        accountRequest.operatorWorkplaceAvailable().manager().receiveResponse();

                        const requests = ajax.inAnyOrder();
                        const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                        const secondAccountRequest = tester.accountRequest().
                            manager().
                            operatorWorkplaceAvailable().
                            forChats().
                            expectToBeSent(requests);

                        const thirdAccountRequest = tester.accountRequest().
                            manager().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        requests.expectToBeSent();
                        thirdAccountRequest.receiveResponse();
                        authCheckRequest.receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();

                        tester.permissionsRequest().
                            allowNumberCapacitySelect().
                            allowNumberCapacityUpdate().
                            receiveResponse();

                        tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                        tester.employeeStatusesRequest().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        notificationTester.grantPermission();
                        tester.allowMediaInput();

                        tester.numberCapacityRequest().receiveResponse();
                        tester.employeeRequest().receiveResponse();
                        tester.authenticatedUserRequest().receiveResponse();
                        tester.registrationRequest().desktopSoftphone().receiveResponse();

                        secondAccountRequest.receiveResponse();

                        tester.employeesWebSocket.connect();
                        tester.employeesInitMessage().expectToBeSent();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();

                        tester.countersRequest().receiveResponse();

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('set-icon').
                            expectToBeSentWithArguments('windows, 150');

                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().forCurrentEmployee().receiveResponse();
                        tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                        tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();

                        tester.callsHistoryButton.expectToBeEnabled();
                    });
                });
                it('Отмечаю чекбокс "Чужой компьютер". Нажимаю на кнопку входа. Логин не сохраняется.', function() {
                    tester.checkbox.click();

                    tester.button('Войти').click();
                    tester.loginRequest().receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('app-ready');

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 212
                        });

                    tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

                    const requests = ajax.inAnyOrder();

                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                    secondAccountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        forChats().
                        expectToBeSent(requests);

                    thirdAccountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    requests.expectToBeSent();
                        thirdAccountRequest.receiveResponse();
                        authCheckRequest.receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();

                        tester.permissionsRequest().
                            allowNumberCapacitySelect().
                            allowNumberCapacityUpdate().
                            receiveResponse();

                        tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                        tester.employeeStatusesRequest().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        notificationTester.grantPermission();
                        tester.numberCapacityRequest().receiveResponse();
                        tester.employeeRequest().receiveResponse();
                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                        tester.registrationRequest().desktopSoftphone().receiveResponse();

                        secondAccountRequest.receiveResponse();
                        
                        tester.employeesWebSocket.connect();
                        tester.employeesInitMessage().expectToBeSent();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();

                        countersRequest = tester.countersRequest().expectToBeSent();

                        offlineMessageCountersRequest = tester.offlineMessageCountersRequest().expectToBeSent();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        newChatListRequest = tester.chatListRequest().forCurrentEmployee().
                            expectToBeSent();
                        activeChatListRequest = tester.chatListRequest().forCurrentEmployee().active().
                            expectToBeSent();
                        closedChatListRequest = tester.chatListRequest().forCurrentEmployee().closed().
                            expectToBeSent();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();
                            
                        offlineMessageCountersRequest.receiveResponse();
                        countersRequest.receiveResponse();

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('set-icon').
                            expectToBeSentWithArguments('windows, 150');

                        newChatListRequest.receiveResponse();
                        activeChatListRequest.receiveResponse();
                        closedChatListRequest.receiveResponse();

                        authenticatedUserRequest.receiveResponse();
                        tester.allowMediaInput();
                });
                it(
                    'Помещаую курсор над иконкой подсказки. Отображено сообщение о том, что пароль не сохранится в ' +
                    'приложении.',
                function() {
                    tester.labelHelp.putMouseOver();
                    tester.tooltip.expectToHaveTextContent('Пароль не сохранится в приложении');
                });
            });
            describe('Логины и пароли были сохранены. Нажимаю на поле логина. Выбираю логин из списка.', function() {
                beforeEach(function() {
                    getPackage('electron').ipcRenderer.receiveMessage('credentials', [{
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    }, {
                        login: 'strashilova',
                        password: '4gSf8wflsdfSF8x',
                        project: 'comagic',
                    }, {
                        login: 'balkanska',
                        password: 'g83glSlfSjb32kx',
                        project: 'comagic',
                    }, {
                        login: 'pramatarova',
                        password: 'g2Lsdf9sHAKkjii',
                        project: 'comagic',
                    }, {
                        login: 'pironeva',
                        password: 'hlsdflDS82ld82o',
                        project: 'uis2',
                    }, {
                        login: 'alexova',
                        password: 'ig8slFsllw82l2o',
                        project: 'comagic',
                    }]);

                    tester.input.withFieldLabel('Логин').click();
                });

                describe('Нажимаю на кнопку удаления логина.', function() {
                    beforeEach(function() {
                        tester.select.option('strashilova').svg.click();
                    });

                    describe('Нажимаю на кнопку подтверждения удаления.', function() {
                        beforeEach(function() {
                            tester.modalWindow.button('Удалить').click();
                            tester.modalWindow.finishHiding();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('delete-login').
                                expectToBeSentWithArguments({
                                    login: 'strashilova',
                                    project: 'comagic',
                                });

                            getPackage('electron').ipcRenderer.receiveMessage('credentials', [{
                                login: 'botusharova',
                                password: '8Gls8h31agwLf5k',
                                project: 'comagic',
                            }, {
                                login: 'balkanska',
                                password: 'g83glSlfSjb32kx',
                                project: 'comagic',
                            }, {
                                login: 'pramatarova',
                                password: 'g2Lsdf9sHAKkjii',
                                project: 'comagic',
                            }, {
                                login: 'pironeva',
                                password: 'hlsdflDS82ld82o',
                                project: 'uis2',
                            }, {
                                login: 'alexova',
                                password: 'ig8slFsllw82l2o',
                                project: 'comagic',
                            }]);
                        });

                        it('Нажимаю на поле логина. В списке логинов отсутствует удаленный логин.', function() {
                            tester.input.withFieldLabel('Логин').click();

                            tester.select.option('botusharova').expectToBeVisible();
                            tester.select.option('strashilova').expectNotToExist();
                        });
                        it('Окно подтверждения скрыто.', function() {
                            tester.modalWindow.expectNotToExist();
                        });
                    });
                    it('Поле логина осталось незаполненным.', function() {
                        tester.input.withFieldLabel('Логин').expectToHaveValue('');
                        tester.modalWindow.expectToHaveWidth(268);
                    });
                });
                it(
                    'Разворачиваю приложение. Нажимаю на кнопку удаления логина. Окно подтверждения широкое.',
                function() {
                    getPackage('electron').ipcRenderer.
                        receiveMessage('maximize');

                    tester.select.option('strashilova').svg.click();
                    tester.modalWindow.expectToHaveWidth(424);
                });
                it(
                    'Выбираю логин. Поле логина заполнено выбранным значением. Поле пароля заполнено соответствующим ' +
                    'логину паролем.',
                function() {
                    tester.select.option('botusharova').click();

                    tester.input.withFieldLabel('Логин').expectToHaveValue('botusharova');
                    tester.input.withFieldLabel('Пароль').expectToHaveValue('8Gls8h31agwLf5k');

                    tester.select.option('botusharova').expectNotToExist();
                });
                it('Ввожу значение в поле логин. Список логинов отфильтрован.', function() {
                    tester.input.withFieldLabel('Логин').fill('botu');

                    tester.select.option('botusharova').expectToBeVisible();
                    tester.select.option('strashilova').expectNotToExist();
                });
                it('Отображен список логинов.', function() {
                    tester.select.option('botusharova').expectToBeVisible();
                    tester.select.option('strashilova').expectToBeVisible();
                    tester.select.option('pironeva').expectNotToExist();
                });
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

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('opened');

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');
                    
                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

                tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

                const requests = ajax.inAnyOrder();
                const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    forChats().
                    expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();
                thirdAccountRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                notificationTester.grantPermission();
                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.employeeRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();

                secondAccountRequest.receiveResponse();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.countersRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 150');

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
            });

            describe('Нажимаю на кнопку максимизации.', function() {
                beforeEach(function() {
                    tester.maximizednessButton.click();

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
                    
                    const requests = ajax.inAnyOrder();

                    const statsRequest = tester.statsRequest().
                        expectToBeSent(requests);

                    const accountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        forChats().
                        expectToBeSent(requests);

                    const secondAccountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    statsRequest.receiveResponse();
                    accountRequest.receiveResponse();
                    secondAccountRequest.receiveResponse();

                    tester.countersRequest().receiveResponse();

                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.markListRequest().receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        active().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        closed().
                        receiveResponse();

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();
                });

                it('Нажимаю на кнопку видимости. Поступил входящий звонок. Софтфон видим.', function() {
                    tester.softphone.visibilityButton.click();

                    tester.incomingCall().receive();
                    tester.numaRequest().receiveResponse();
                    tester.outCallEvent().activeLeads().receive();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-start').
                        expectToBeSentWithArguments(true);

                    tester.accountRequest().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.stopCallButton.expectToBeVisible();
                });
                it('Поступил входящий звонок. Звонок завершен. Софтфон скрыт.', function() {
                    const incomingCall = tester.incomingCall().receive();
                    tester.numaRequest().receiveResponse();
                    tester.outCallEvent().activeLeads().receive();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-start').
                        expectToBeSentWithArguments(true);

                    tester.stopCallButton.click();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-end').
                        expectToBeSentWithArguments(true);

                    incomingCall.expectBusyHereToBeSent();
                    tester.dialpadButton(1).expectNotToExist();
                });
            });
            describe('Нажимаю на кнопку контактов в нижнем тулбаре.', function() {
                beforeEach(function() {
                    tester.contactsButton.click();

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

                    const requests = ajax.inAnyOrder();

                    const contactsRequest = tester.contactsRequest().
                        differentNames().
                        expectToBeSent(requests);

                    const accountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        forChats().
                        expectToBeSent(requests);

                    const secondAccountRequest = tester.accountRequest().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    accountRequest.receiveResponse();
                    secondAccountRequest.receiveResponse();
                    contactsRequest.receiveResponse();

                    tester.countersRequest().receiveResponse();

                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.markListRequest().receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        active().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        closed().
                        receiveResponse();

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();
                });

                it('Скрываю софтфон. Открываю контакт.', function() {
                    tester.softphone.visibilityButton.click();
                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    const requests = ajax.inAnyOrder();

                    const contactRequest = tester.contactRequest().expectToBeSent(requests);

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                        expectToBeSent(requests);

                    const usersRequest = tester.usersRequest().forContacts().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    usersRequest.receiveResponse();
                    contactRequest.receiveResponse();
                    contactCommunicationsRequest.receiveResponse();

                    tester.contactBar.
                        section('Телефоны').
                        anchor('79162729533').
                        click();

                    tester.firstConnection.connectWebRTC();
                    tester.allowMediaInput();

                    tester.outgoingCall().fifthPhoneNumber().expectToBeSent().setRinging();
                    tester.firstConnection.callTrackHandler();
                    tester.numaRequest().fourthPhoneNumber().receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-start').
                        expectToBeSentWithArguments(true);

                    tester.accountRequest().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.softphone.expectTextContentToHaveSubstring('+7 (916) 272-95-33');
                });
                it('Открыт раздел контактов.', function() {
                    tester.contactsButton.expectToBePressed();
                });
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
                        expectToBeSentToChannel('call-start').
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

                    incomingCall.expectBusyHereToBeSent();
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

                describe(
                    'Открываю вкладку "Помощь". Ввожу значение в поле описания, нажимаю на кнопку "Отправить".',
                function() {
                    beforeEach(function() {
                        tester.button('Помощь').click();

                        tester.textarea.
                            withPlaceholder('Опишите проблему').
                            fill('Что-то нехорошее произошло');

                        tester.button('Отправить').click();

                        getPackage('electron').ipcRenderer.
                            recentlySentMessage().
                            expectToBeSentToChannel('collect_logs').
                            expectToBeSentWithArguments(0);
                    });

                    it('Архив логов получен.', function() {
                        getPackage('electron').ipcRenderer.receiveMessage(
                            'logs_collected',
                            'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/auth/check',
                            0,
                        );

                        tester.feedbackCreatingRequest().receiveResponse();

                        blobsTester.some(blob => blob.expectToHaveSubstring(
                            'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/auth/check'
                        ));
                    });
                    it('Данные формы помощи не были отправлены.', function() {
                        ajax.expectNoRequestsToBeSent();
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

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('opened');

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

                tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

                const requests = ajax.inAnyOrder();
                const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    forChats().
                    expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();
                thirdAccountRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                notificationTester.grantPermission();
                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.employeeRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();

                secondAccountRequest.receiveResponse();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.countersRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 150');

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
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
                    expectToBeSentToChannel('call-start').
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

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('opened');

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

                tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

                const requests = ajax.inAnyOrder();
                const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    forChats().
                    expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();
                thirdAccountRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                notificationTester.grantPermission();
                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.employeeRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();

                secondAccountRequest.receiveResponse();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.countersRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 150');

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
            });

            it('Нажимаю на кнопку максимизации. Поступил входящий звонок. Звонок завершен. Софтфон видим.', function() {
                tester.maximizednessButton.click();

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
                
                const requests = ajax.inAnyOrder();

                const statsRequest = tester.statsRequest().
                    expectToBeSent(requests);

                const accountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    forChats().
                    expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                statsRequest.receiveResponse();
                accountRequest.receiveResponse();
                secondAccountRequest.receiveResponse();

                tester.countersRequest().receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    secondPage().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    secondPage().
                    active().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    secondPage().
                    closed().
                    receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                const incomingCall = tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-start').
                    expectToBeSentWithArguments(true);

                tester.stopCallButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-end').
                    expectToBeSentWithArguments(false);

                incomingCall.expectBusyHereToBeSent();
                tester.dialpadButton(1).expectToBeVisible();
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
                    expectToBeSentToChannel('call-start').
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

                incomingCall.expectBusyHereToBeSent();
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

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('opened');

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                const requests = ajax.inAnyOrder();
                const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    forChats().
                    expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();
                thirdAccountRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                notificationTester.grantPermission();
                tester.allowMediaInput();

                tester.numberCapacityRequest().receiveResponse();
                tester.employeeRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();

                secondAccountRequest.receiveResponse();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.countersRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 150');

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
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
                    expectToBeSentToChannel('call-start').
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

                incomingCall.expectBusyHereToBeSent();
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
        it('Ранее софтфон был большим. Софтфон большой.', function() {
            localStorage.setItem('isSoftphoneHigh', 'true');
            localStorage.setItem('isLarge', 'true');

            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true,
                appName: 'softphone'
            });

            tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('maximize');

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('app-ready');

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 568
                });

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('opened');

            const requests = ajax.inAnyOrder();

            const authCheckRequest = tester.authCheckRequest().
                expectToBeSent(requests);

            const statsRequest = tester.statsRequest().
                secondEarlier().
                expectToBeSent(requests);

            const accountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                forChats().
                expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            const thirdAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            requests.expectToBeSent();

            statsRequest.receiveResponse();
            accountRequest.receiveResponse();
            secondAccountRequest.receiveResponse();
            thirdAccountRequest.receiveResponse();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            tester.countersRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('set-icon').
                expectToBeSentWithArguments('windows, 150');

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            tester.chatListRequest().forCurrentEmployee().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

            tester.chatChannelTypeListRequest().receiveResponse();

            tester.offlineMessageListRequest().notProcessed().receiveResponse();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();
            tester.employeeStatusesRequest().receiveResponse();

            tester.connectEventsWebSocket();

            tester.connectSIPWebSocket();
            tester.registrationRequest().desktopSoftphone().receiveResponse();

            notificationTester.grantPermission();
            tester.allowMediaInput();

            tester.employeeRequest().receiveResponse();
            tester.authenticatedUserRequest().receiveResponse();

            tester.dialpadButton(1).expectToBeVisible();
            tester.leftMenu.expectToBeVisible();
        });
        it('Я уже аутентифицирован. Плейсхолдер поля для ввода номера локализован.', function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true,
                appName: 'softphone'
            });

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('app-ready');

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 212
                });

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('opened');

            tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

            const requests = ajax.inAnyOrder();
            const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                forChats().
                expectToBeSent(requests);

            const thirdAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            requests.expectToBeSent();
            thirdAccountRequest.receiveResponse();
            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();

            tester.permissionsRequest().
                allowNumberCapacitySelect().
                allowNumberCapacityUpdate().
                receiveResponse();

            tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            notificationTester.grantPermission();
            tester.allowMediaInput();

            tester.employeeStatusesRequest().receiveResponse();
            tester.numberCapacityRequest().receiveResponse();
            tester.employeeRequest().receiveResponse();
            tester.authenticatedUserRequest().receiveResponse();
            tester.registrationRequest().desktopSoftphone().receiveResponse();

            secondAccountRequest.receiveResponse();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            tester.countersRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('set-icon').
                expectToBeSentWithArguments('windows, 150');

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            tester.chatListRequest().forCurrentEmployee().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

            tester.chatChannelTypeListRequest().receiveResponse();

            tester.offlineMessageListRequest().notProcessed().receiveResponse();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            tester.phoneField.expectToHaveValue('Введите номер');
        });
        it('Ранее софтфон был раскрыт. Открываю софтфон. Он раскрыт.', function() {
            localStorage.setItem('isSoftphoneHigh', 'true');

            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true,
                appName: 'softphone'
            });

            getPackage('electron').
                ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('app-ready');

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 568
                });

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('opened');

            tester.accountRequest().operatorWorkplaceAvailable().receiveResponse();

            const requests = ajax.inAnyOrder();
            const authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                forChats().
                expectToBeSent(requests);

            const thirdAccountRequest = tester.accountRequest().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            requests.expectToBeSent();
            thirdAccountRequest.receiveResponse();
            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();

            tester.permissionsRequest().
                allowNumberCapacitySelect().
                allowNumberCapacityUpdate().
                receiveResponse();

            tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            notificationTester.grantPermission();
            tester.allowMediaInput();

            tester.employeeStatusesRequest().receiveResponse();
            tester.numberCapacityRequest().receiveResponse();
            tester.employeeRequest().receiveResponse();
            tester.authenticatedUserRequest().receiveResponse();
            tester.registrationRequest().desktopSoftphone().receiveResponse();

            secondAccountRequest.receiveResponse();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            tester.countersRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('set-icon').
                expectToBeSentWithArguments('windows, 150');

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            tester.chatListRequest().forCurrentEmployee().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

            tester.chatChannelTypeListRequest().receiveResponse();

            tester.offlineMessageListRequest().notProcessed().receiveResponse();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            tester.dialpadButton(1).expectToBeVisible();
        });
    });
});
