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
            'Используется старое десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку входа. Получено ' +
            'обновление.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');

                getPackage('electron').ipcRenderer.receiveMessage('credentials', []);

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

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

                getPackage('electron').ipcRenderer.receiveMessage('credentials', [{
                    login: 'botusharova',
                    password: '8Gls8h31agwLf5k',
                    project: 'comagic',
                }]);

                accountRequest = tester.accountRequest().expectToBeSent();

                accountRequest.operatorWorkplaceAvailable().receiveResponse();
                tester.masterInfoMessage().receive();

                tester.employeesBroadcastChannel().
                    applyLeader().
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

                thirdAccountRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.employeeStatusesRequest().receiveResponse();

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

                tester.offlineMessageListRequest().
                    contactExists().
                    notProcessed().
                    receiveResponse();

                tester.offlineMessageListRequest().
                    processing().
                    receiveResponse();

                tester.offlineMessageListRequest().
                    contactExists().
                    processed().
                    receiveResponse();

                offlineMessageCountersRequest.receiveResponse();
                countersRequest.receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('set-icon').
                    expectToBeSentWithArguments('windows, 150');

                newChatListRequest.receiveResponse();
                activeChatListRequest.receiveResponse();
                closedChatListRequest.receiveResponse();

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

                getPackage('electron').ipcRenderer.
                    receiveMessage('update-downloaded');
            });

            it(
                'Нажимаю на кнопку "Обновить". Устанавливается обновление.',
            function() {
                tester.button('Обновить').click();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
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
        describe(
            'Использую новое десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку входа. Получено ' +
            'обновление.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone',
                    shouldShowNewSoftphone: true,
                });
                
                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('opened');
                
                getPackage('electron').ipcRenderer.receiveMessage('credentials', []);
                
                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

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

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('login').
                    expectToBeSentWithArguments({
                        login: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                    });

                getPackage('electron').ipcRenderer.
                    nextSentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });
                
                getPackage('electron').ipcRenderer.receiveMessage('credentials', [{
                    login: 'botusharova',
                    password: '8Gls8h31agwLf5k',
                    project: 'comagic',
                }]);
                
                tester.employeeStatusesRequest().receiveResponse();

                tester.accountRequest().
                    operatorWorkplaceAvailable().
                    receiveResponse();
                
                tester.masterInfoMessage().receive();
                
                tester.employeesBroadcastChannel().
                    applyLeader().
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

            describe('Получено обновление.', function() {
                beforeEach(function() {
                    getPackage('electron').
                        ipcRenderer.
                        receiveMessage('update-downloaded');
                });

                it('Нажимаю на кнпоку обновления. Приложение обновилось.', function() {
                    tester.button('Обновить').click();

                    getPackage('electron').ipcRenderer.
                        nextSentMessage().
                        expectToBeSentToChannel('quit-and-install');

                    tester.button('Обновить').expectNotToExist();
                });
                it('Кнопка обновления видима.', function() {
                    tester.button('Обновить').expectToBeVisible();
                });
            });
            it(
                'Открыто окно софтфона. Получено обновление. Нажимаю на кнпоку обновления. Приложение обновилось.',
            function() {
                getPackage('electron').
                    ipcRenderer.
                    receiveMessage('[ipcMain.window.softphone]:open-softphone');

                getPackage('electron').
                    ipcRenderer.
                    receiveMessage('update-downloaded');

                tester.button('Обновить').expectToBeVisible();
            });
            it('Кнопка обновления отсутствует.', function() {
                tester.button('Обновить').expectNotToExist();
            });
        });
    });
});
