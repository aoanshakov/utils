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
                
                tester.ssoCheckRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.apiLoginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

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
                
                tester.employeeStatusesRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    noAuthorizationHeader().
                    receiveResponse();
                
                tester.masterInfoMessage().receive();
                
                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();
                
                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();
                
                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();
                
                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();
                
                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();
                
                tester.slavesNotification().expectToBeSent();
                
                tester.slavesNotification().
                    additional().
                    expectToBeSent();
                
                const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                    emptySearchString().
                    expectToBeSent();

                const authCheckRequest = tester.authCheckRequest().expectToBeSent(),
                    callsRequest = tester.callsRequest().expectToBeSent();

                chatChannelSearchRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                callsRequest.receiveResponse();

                const secondChatChannelSearchRequest = tester.chatChannelSearchRequest().
                    emptySearchString().
                    expectToBeSent();

                tester.talkOptionsRequest().receiveResponse();
                
                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();
                
                tester.settingsRequest().
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
                tester.employeeRequest().receiveResponse();
                
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
    });
});
