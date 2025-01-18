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
                });
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');
                
                getPackage('electron').ipcRenderer.receiveMessage('credentials', []);

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('darkmode:disable');
                
                /*
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('app-ready');

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 300,
                        height: 350,
                    });
                */
                
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
                    expectToBeSentToChannel('set-mini-widget');
                
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

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.softphoneBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();
 
                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesWebSocket.
                    ssoAuth().
                    connect();

                tester.employeesInitMessage().
                    ssoAuth().
                    expectToBeSent();

                tester.employeesWebsocketConnectedMessage().expectToBeSent();
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

            it('', function() {
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
