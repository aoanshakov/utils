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

    describe(
        'Открываю десктопное приложение софтфона. Софтфон не должен отображаться поверх окон при входящем. Логины и ' +
        'пароли не были сохранены. Ввожу логин и пароль. Нажимаю на кнопку входа. Софтфон доступен. Софтфон ' +
        'авторизован. Нет непрочитанных заявок. Есть непрочитанные сообщения. SIP-линия зарегистрирована. Получен ' +
        'доступ к микрофону.',
    function() {
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

            tester.employeeStatusesRequest().many().receiveResponse();

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
        });

        xdescribe('Раскрываю список статусов.', function() {
            beforeEach(function() {
                tester.userName.click();
            });

            it('Выбираю статус. Список статусов скрыт.', function() {
                tester.statusesList.item('Нет на месте').click();
                tester.employeeUpdatingRequest().receiveResponse();

                tester.statusesList.expectNotToExist();
            });
            it('Отображены статусы.', function() {
                tester.statusesList.item('Не беспокоить').expectToBeSelected();
                tester.statusesList.item('Доступен').expectNotToBeSelected();
                tester.statusesList.item('Неизвестно').expectNotToExist();

                tester.statusesList.expectToHaveHeight(172);
            });
        });
        it('Нажимаю на кнопку развернутости. Раскрываю список статусов.', function() {
            tester.collapsednessToggleButton.click();

            getPackage('electron').ipcRenderer.
                nextSentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 568
                });

            tester.userName.click();
            tester.statusesList.expectToHaveHeight(330);
        })
    });
});
