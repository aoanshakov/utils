tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        addSecond,
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
        let tester,
            authenticatedUserRequest,
            accountRequest,
            secondAccountRequest,
            authCheckRequest,
            thirdAccountRequest,
            countersRequest,
            newChatListRequest,
            activeChatListRequest,
            closedChatListRequest,
            offlineMessageCountersRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            localStorage.setItem('clct:to_top_on_call', 'false');
            localStorage.setItem('isSpaceCallAnswer', 'true');
        });

        xdescribe(
            'Использую новое десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку входа. Получено ' +
            'обновление.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone',
                    shouldShowNewSoftphone: true,
                    hasSSOAuth: true,
                });
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('darkmode:disable');
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');

                tester.ssoCheckRequest().receiveResponse();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.hostBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.apiLoginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 300,
                        height: 350,
                    });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('set-mini-widget');

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
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

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                const authTokenRequest = tester.authTokenRequest().expectToBeSent();

                tester.employeesSsoCheckRequest().receiveResponse();
                tester.employeesWebSocket.connect();

                tester.employeesInitMessage().
                    ssoAuth().
                    expectToBeSent();

                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                authTokenRequest.receiveResponse();

                const authCheckRequest = tester.authCheckRequest().
                    ssoAuth().
                    expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.employeeStatusesRequest().
                    noAuthorizationHeader().
                    receiveResponse();
                
                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();
                
                tester.settingsRequest().
                    ssoAuth().
                    allowNumberCapacitySelect().
                    receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();
                
                tester.connectEventsWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();
                
                tester.connectSIPWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();
                
                notificationTester.grantPermission();
                tester.numberCapacityRequest().receiveResponse();
                
                tester.marksRequest().receiveResponse();

                tester.callsRequest().
                    forWeek().
                    receiveResponse();

                tester.employeeSettingsRequest().receiveResponse();
                
                tester.employeeRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                
                tester.registrationRequest().
                    desktopSoftphone().
                    receiveUnauthorized();
                
                tester.registrationRequest().
                    desktopSoftphone().
                    authorization().
                    receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    registered().
                    expectToBeSent();
                
                authenticatedUserRequest.receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    registered().
                    userDataFetched().
                    expectToBeSent();
                
                tester.allowMediaInput();
                
                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();
            });

            it('Нажимаю на кнопку настроек. Открыта страница настроек в главном окне РМО.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('[ipcRenderer.window.softphone]:open-softphone-settings');
            });
        });
        describe('', function() {
            beforeEach(function() {
                localStorage.setItem('isLarge', 'true');

                tester = new Tester({
                    ...options,
                    appName: 'softphone',
                    shouldShowNewSoftphone: true,
                    hasSSOAuth: true,
                });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('darkmode:disable');
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');

                tester.ssoCheckRequest().receiveResponse();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.hostBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.apiLoginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 300,
                        height: 350,
                    });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('set-mini-widget');

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
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

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.softphoneBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568,
                    });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('maximize');

                const authTokenRequest = tester.authTokenRequest().expectToBeSent();
                const reportsListRequest = tester.reportsListRequest().expectToBeSent();

                const employeeStatusesRequest = tester.employeeStatusesRequest().
                    noAuthorizationHeader().
                    expectToBeSent();

                const accountRequest = tester.accountRequest().
                    forChats().
                    operatorWorkplaceAvailable().
                    noAuthorizationHeader().
                    expectToBeSent();

                const employeesSsoCheckRequest = tester.employeesSsoCheckRequest().expectToBeSent();

                reportsListRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();

                accountRequest.receiveResponse();
                const chatsSsoWsCheckRequest = tester.chatsSsoWsCheckRequest().expectToBeSent();

                tester.tagsRequest().receiveResponse();
                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.groupChatsRequest().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 75');

                tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    active().
                    receiveResponse();

                tester.chatListRequest().forCurrentEmployee().
                    closed().
                    noData().
                    receiveResponse();

                chatsSsoWsCheckRequest.receiveResponse();
                tester.chatsWebSocket.connect();

                tester.chatsInitMessage().
                    ssoAuth().
                    expectToBeSent();

                employeesSsoCheckRequest.receiveResponse();
                tester.employeesWebSocket.connect();

                tester.employeesInitMessage().
                    ssoAuth().
                    expectToBeSent();

                tester.employeesWebsocketConnectedMessage().expectToBeSent();
                tester.employeeSettingsRequest().receiveResponse();
                
                tester.employeeRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                authTokenRequest.receiveResponse();

                const authCheckRequest = tester.authCheckRequest().
                    ssoAuth().
                    expectToBeSent();

                authCheckRequest.receiveResponse();

                const statsRequest = tester.statsRequest().
                    ssoAuth().
                    secondEarlier().
                    expectToBeSent();

                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();
                
                tester.settingsRequest().
                    ssoAuth().
                    allowNumberCapacitySelect().
                    receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();
                
                tester.connectEventsWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();
                
                tester.connectSIPWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();
                
                notificationTester.grantPermission();
                tester.numberCapacityRequest().receiveResponse();
                
                tester.marksRequest().receiveResponse();

                tester.callsRequest().
                    forWeek().
                    receiveResponse();

                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                
                tester.registrationRequest().
                    desktopSoftphone().
                    receiveUnauthorized();
                
                tester.registrationRequest().
                    desktopSoftphone().
                    authorization().
                    receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    registered().
                    expectToBeSent();
                
                authenticatedUserRequest.receiveResponse();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    registered().
                    userDataFetched().
                    expectToBeSent();
                
                tester.allowMediaInput();
                
                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();

                statsRequest.receiveResponse();
            });

            describe('Открываю настройки.', function() {
                beforeEach(function() {
                    tester.button('Настройки').click();

                    getPackage('electron').ipcRenderer.
                        nextSentMessage().
                        expectToBeSentToChannel('settings-state-changed').
                        expectToBeSentWithArguments(true);
                });

                describe('Открываю вкладку "Софтфон".', function() {
                    beforeEach(function() {
                        tester.tab('Софтфон').click();

                        getPackage('electron').ipcRenderer.
                            nextSentMessage().
                            expectToBeSentToChannel('settings-state-changed').
                            expectToBeSentWithArguments(true);

                        getPackage('electron').ipcRenderer.
                            nextSentMessage().
                            expectToBeSentToChannel('settings-state-changed').
                            expectToBeSentWithArguments(false);

                        tester.triggerScrollRecalculation();
                    });

                    it('Отмечаю свитчбокс "Открывать во время звонка". Значение должно быть сохранено.', function() {
                        tester.switchButton('Открывать во время звонка').click();

                        if (localStorage.getItem('clct:to_top_on_call') !== 'true') {
                            throw new Error(
                                'Значение параметра "Открывать во время звонка" должно ' +
                                'быть сохранено.'
                            );
                        }
                    });
                    it('Свитчбокс "Открывать во время звонка" не должен быть отмечен.', function() {
                        tester.switchButton('Открывать во время звонка').expectNotToBeChecked();

                        tester.tab('Общие').expectNotToBeSelected();
                        tester.tab('Софтфон').expectToBeSelected();
                        tester.tab('Чаты').expectNotToBeSelected();
                        tester.tab('Поддержка').expectNotToBeSelected();

                        if (localStorage.getItem('clct:to_top_on_call') !== 'false') {
                            throw new Error(
                                'Значение параметра "Открывать во время звонка" должно ' +
                                'быть сохранено.'
                            );
                        }
                    });
                });
                describe('Открываю вкладку "Чаты".', function() {
                    beforeEach(function() {
                        tester.tab('Чаты').click();

                        getPackage('electron').ipcRenderer.
                            nextSentMessage().
                            expectToBeSentToChannel('settings-state-changed').
                            expectToBeSentWithArguments(false);

                        tester.chatSettingsRequest().receiveResponse();
                    });

                    it('Отмечаю свитчбокс "Push-уведомления для чатов".', function() {
                        tester.switchButton('Push-уведомления для чатов').click();

                        tester.chatSettingsUpdatingRequest().
                            chatNotificationEnabled().
                            receiveResponse();
                    });
                    it('Свитчбокс "Push-уведомления для чатов" не отмечен.', function() {
                        tester.switchButton('Push-уведомления для чатов').expectNotToBeChecked();

                        tester.tab('Общие').expectNotToBeSelected();
                        tester.tab('Софтфон').expectNotToBeSelected();
                        tester.tab('Чаты').expectToBeSelected();
                        tester.tab('Поддержка').expectNotToBeSelected();
                    });
                });
                it('Открываю вкладку "Поддержка".', function() {
                    tester.tab('Поддержка').click();

                    tester.tab('Общие').expectNotToBeSelected();
                    tester.tab('Софтфон').expectNotToBeSelected();
                    tester.tab('Чаты').expectNotToBeSelected();
                    tester.tab('Поддержка').expectToBeSelected();

                    getPackage('electron').ipcRenderer.
                        nextSentMessage().
                        expectToBeSentToChannel('settings-state-changed').
                        expectToBeSentWithArguments(false);

                    tester.body.expectTextContentToHaveSubstring(
                        'Составьте обращение в техническую поддержку или найдите решение в справочном центре'
                    );
                });
                it('Открыта вкладка "Общие".', function() {
                    tester.switchButton('Автозапуск приложения').expectToBeVisible();

                    tester.tab('Общие').expectToBeSelected();
                    tester.tab('Софтфон').expectNotToBeSelected();
                    tester.tab('Чаты').expectNotToBeSelected();
                    tester.tab('Поддержка').expectNotToBeSelected();
                });
            });
        });
        return;
        describe(
            'Использую новое десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку входа. Получено ' +
            'обновление.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone',
                    shouldShowNewSoftphone: true,
                    hasSSOAuth: true,
                    windowId: 'softphone',
                });
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');
                
                getPackage('electron').ipcRenderer.receiveMessage('credentials', []);

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('darkmode:disable');
                
                tester.ssoCheckRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.apiLoginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
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
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('app-ready');
                
                tester.employeeStatusesRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    noAuthorizationHeader().
                    receiveResponse();
                
                const employeesBroadcastChannel = tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                    emptySearchString().
                    expectToBeSent();

                tester.ssoWsCheckingRequest().receiveResponse();
                tester.ssoWsCheckingRequest().receiveResponse();

                employeesBroadcastChannel.waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.authTokenRequest().receiveResponse();

                const authCheckRequest = tester.authCheckRequest().
                    ssoAuth().
                    expectToBeSent();

                const callsRequest = tester.callsRequest().
                    forTwoWeeks().
                    receiveResponse();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                
                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();
                
                tester.settingsRequest().
                    ssoAuth().
                    allowNumberCapacitySelect().
                    receiveResponse();
                
                notificationTester.grantPermission();
                tester.numberCapacityRequest().receiveResponse();
                
                tester.softphoneBroadcastChannel().
                    tellIsLeader().
                    receive();
 
                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    receive();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesWebsocketConnectedRequest().expectToBeSent();
                tester.employeesWebsocketConnectedMessage().receive();

                tester.softphoneBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterNotification().
                    tabOpened().
                    expectToBeSent();

                tester.employeeSettingsRequest().receiveResponse();
                
                tester.employeeRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    receive();
            });

            it('', function() {
            });
        });
    });
});
