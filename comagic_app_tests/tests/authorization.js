tests.addTest(options => {
   const {
        utils,
        setFocus,
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

    xdescribe('Открываю страницу чатов.', function() {
        let tester,
            reportGroupsRequest,
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            chatListRequest,
            secondChatListRequest,
            thirdChatListRequest,
            countersRequest,
            employeeStatusesRequest,
            chatSettingsRequest,
            offlineMessageListRequest,
            searchResultsRequest,
            messageListRequest,
            visitorCardRequest,
            messageAddingRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();

            accountRequest = tester.accountRequest().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent();

            accountRequest.receiveResponse();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            requests = ajax.inAnyOrder();

            tester.ticketsContactsRequest().receiveResponse();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
            const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();

            employeeSettingsRequest.receiveResponse();
            employeeRequest.receiveResponse();

            {
                const requests = ajax.inAnyOrder();

                const accountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                    listRequest = tester.listRequest().expectToBeSent(requests),
                    siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                    commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().expectToBeSent(requests),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                secondAccountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                accountRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                commonMessageTemplatesRequest.receiveResponse();
                reportsListRequest.receiveResponse();
            }

            tester.messageTemplatesSettingsRequest().receiveResponse();
            countersRequest = tester.countersRequest().expectToBeSent();

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            chatListRequest = tester.chatListRequest().forCurrentEmployee().expectToBeSent();
            secondChatListRequest = tester.chatListRequest().forCurrentEmployee().active().expectToBeSent();
            thirdChatListRequest = tester.chatListRequest().forCurrentEmployee().closed().expectToBeSent();

            tester.chatChannelTypeListRequest().receiveResponse();

            offlineMessageListRequest = tester.offlineMessageListRequest().notProcessed().expectToBeSent();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            offlineMessageListRequest.receiveResponse();
            chatSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            countersRequest.receiveResponse();
            chatListRequest.receiveResponse();
            thirdChatListRequest.receiveResponse();
            secondChatListRequest.receiveResponse();
        });

        describe('Открываю чат. Ввожу сообщение. Нажимаю на кнопку отправки сообщения.', function() {
            beforeEach(function() {
                tester.chatList.
                    header.
                    button.
                    atIndex(1).
                    click();

                tester.input.fill('Сообщение #75');
                
                tester.input.pressEnter();

                searchResultsRequest = tester.searchResultsRequest().expectToBeSent();
                searchResultsRequest.receiveResponse();

                tester.chatListItem('Сообщение #75').click();

                chatListRequest = tester.chatListRequest().
                    thirdChat().
                    expectToBeSent();

                chatListRequest.
                    noVisitorName().
                    extIdSpecified().
                    receiveResponse();

                visitorCardRequest = tester.visitorCardRequest().
                    expectToBeSent();

                messageListRequest = tester.messageListRequest().
                    expectToBeSent();

                tester.chatInfoRequest().receiveResponse();
                tester.usersRequest().forContacts().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                messageListRequest.receiveResponse();

                visitorCardRequest.
                    addSecondPhoneNumber().
                    receiveResponse();

                tester.contactGroupsRequest().receiveResponse();
                tester.usersRequest().forContacts().receiveResponse();

                tester.button('Принять чат в работу').click();
                tester.acceptChatRequest().receiveResponse();

                tester.textarea.
                    withPlaceholder('Введите сообщение...').
                    fill('Мне тревожно, успокой меня');

                tester.chatMessageSendingButton.click();

                messageAddingRequest =
                    tester.messageAddingRequest().
                    expectToBeSent();

                tester.changeMessageStatusRequest().
                    anotherChat().
                    anotherMessage().
                    read().
                    receiveResponse();
            });

            describe('Токен авторизации истек.', function() {
                let refreshRequest;

                beforeEach(function() {
                    messageAddingRequest.
                        accessTokenExpired().
                        receiveResponse();

                    refreshRequest = tester.refreshRequest().expectToBeSent();
                });

                it('Не удалось обновить токен авторизации.', function() {
                    refreshRequest.
                        refreshTokenExpired().
                        receiveResponse();

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.input.
                        withFieldLabel('Логин').
                        expectToBeVisible();
                });
                it('Удалось обновить токен авторизации. Сообщение отправлено.', function() {
                    refreshRequest.receiveResponse();

                    tester.messageAddingRequest().
                        anotherAuthorizationToken().
                        receiveResponse();
                });
            });
            it('Токен невалиден. Отключены вебсокеты.', function() {
                messageAddingRequest.
                    accessTokenInvalid().
                    receiveResponse();

                tester.chatsWebSocket.finishDisconnecting();
                tester.employeesWebSocket.finishDisconnecting();

                tester.input.
                    withFieldLabel('Логин').
                    expectToBeVisible();
            });
            it('Сообщение отправлено.', function() {
                messageAddingRequest.receiveResponse();
            });
        });
        describe('Открываю страницу контактов.', function() {
            let contactsRequest;

            beforeEach(function() {
                tester.button('Контакты').click();

                tester.usersRequest().
                    forContacts().
                    receiveResponse();

                contactsRequest = tester.contactsRequest().expectToBeSent();
                tester.contactGroupsRequest().receiveResponse();
            });

            describe('Получены контакты.', function() {
                let contactCommunicationsRequest,
                    contactRequest;
                
                beforeEach(function() {
                    contactsRequest.differentNames().receiveResponse();

                    tester.contactList.
                        item('БГ Бележкова Грета Ервиновна').
                        click();

                    const requests = ajax.inAnyOrder();

                    contactCommunicationsRequest = tester.contactCommunicationsRequest().
                        secondEarlier().
                        expectToBeSent(requests);

                    contactRequest = tester.contactRequest().expectToBeSent(requests);

                    const usersRequest = tester.usersRequest().
                        forContacts().
                        expectToBeSent(requests);

                    requests.expectToBeSent();
                    usersRequest.receiveResponse();

                    contactRequest.receiveResponse();
                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    contactCommunicationsRequest.receiveResponse();
                });

                it('Выхожу из аккаунта. Вхожу снова. Отображены чаты.', function() {
                    tester.userName.click();
                    tester.logoutButton.click();

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.input.withFieldLabel('Логин').fill('botusharova');
                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                    tester.button('Войти').click();
                    tester.loginRequest().receiveResponse();

                    accountRequest = tester.accountRequest().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.employeesWebSocket.connect();
                    tester.employeesInitMessage().expectToBeSent();

                    {

                        employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent();
                        const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),
                            employeeRequest = tester.employeeRequest().expectToBeSent();
                        reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent();
                        const reportsListRequest = tester.reportsListRequest().expectToBeSent(),
                        reportTypesRequest = tester.reportTypesRequest().expectToBeSent(),
                        ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent();

                        const usersRequest = tester.usersRequest().
                            forContacts().
                            expectToBeSent();

                        const contactsRequest = tester.contactsRequest().expectToBeSent(),
                            secondContactsRequest = tester.contactsRequest().expectToBeSent(),
                            contactGroupsRequest = tester.contactGroupsRequest().expectToBeSent(),
                            groupsContainingContactRequest = tester.groupsContainingContactRequest().expectToBeSent();
                            secondContactGroupsRequest =  tester.contactGroupsRequest().expectToBeSent();

                        const secondUsersRequest = tester.usersRequest().
                            forContacts().
                            expectToBeSent();

                        const contactRequest = tester.contactRequest().expectToBeSent();

                        const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                            secondEarlier().
                            expectToBeSent();

                        employeeStatusesRequest.receiveResponse();
                        employeeSettingsRequest.receiveResponse();
                        employeeRequest.receiveResponse();
                        reportGroupsRequest.receiveResponse();
                        reportsListRequest.receiveResponse();
                        reportTypesRequest.receiveResponse();
                        ticketsContactsRequest.receiveResponse();
                        usersRequest.receiveResponse();
                        contactsRequest.receiveResponse();
                        secondContactsRequest.receiveResponse();
                        contactGroupsRequest.receiveResponse();
                        groupsContainingContactRequest.receiveResponse();
                        secondContactGroupsRequest.receiveResponse();
                        secondUsersRequest.receiveResponse();
                        contactRequest.receiveResponse();
                        contactCommunicationsRequest.receiveResponse();
                    }

                    tester.groupsContainingContactRequest().receiveResponse();
                });
                it('Отображены контакты.', function() {
                    tester.contactBar.
                        section('ФИО').
                        expectToHaveTextContent('ФИО Бележкова Грета Ервиновна');
                });
            });
            describe('Токен авторизации истек.', function() {
                let refreshRequest;

                beforeEach(function() {
                    contactsRequest.accessTokenExpired().receiveResponse();
                    refreshRequest = tester.refreshRequest().expectToBeSent();
                });

                it('Не удалось обновить токен авторизации.', function() {
                    refreshRequest.
                        refreshTokenExpired().
                        receiveResponse();

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.input.
                        withFieldLabel('Логин').
                        expectToBeVisible();
                });
                it('Токен обновлен. Отправлен повторный запрос контактов.', function() {
                    refreshRequest.receiveResponse();

                    tester.contactsRequest().
                        anotherAuthorizationToken().
                        receiveResponse();
                });
            });
            it('Токен невалиден. Отключены вебсокеты.', function() {
                contactsRequest.
                    accessTokenInvalid().
                    receiveResponse();

                tester.chatsWebSocket.finishDisconnecting();
                tester.employeesWebSocket.finishDisconnecting();

                tester.input.
                    withFieldLabel('Логин').
                    expectToBeVisible();
            });
        });
        describe('Выбираю другой статус.', function() {
            let refreshRequest,
                employeeUpdatingRequest;

            beforeEach(function() {
                tester.userName.click();
                tester.statusesList.item('Нет на месте').click();

                employeeUpdatingRequest = tester.employeeUpdatingRequest().
                    checkAuthorizationHeader().
                    expectToBeSent();
            });

            describe('Токен авторизации истек.', function() {
                beforeEach(function() {
                    employeeUpdatingRequest.
                        accessTokenExpired().
                        receiveResponse();

                    refreshRequest = tester.refreshRequest().expectToBeSent();
                });

                it('Не удалось обновить токен авторизации.', function() {
                    refreshRequest.
                        refreshTokenExpired().
                        receiveResponse();

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.input.
                        withFieldLabel('Логин').
                        expectToBeVisible();
                });
                it('Токен обновлен. Отправлен повторный запрос контактов.', function() {
                    refreshRequest.receiveResponse();

                    tester.employeeUpdatingRequest().
                        anotherAuthorizationToken().
                        receiveResponse();
                });
            });
            it('Токен невалиден. Отключены вебсокеты.', function() {
                employeeUpdatingRequest.
                    accessTokenInvalid().
                    receiveResponse();

                tester.chatsWebSocket.finishDisconnecting();
                tester.employeesWebSocket.finishDisconnecting();

                tester.input.
                    withFieldLabel('Логин').
                    expectToBeVisible();
            });
            it('Статус изменён.', function() {
                employeeUpdatingRequest.receiveResponse();
            });
        });
        it('Выхожу из аккаунта. Вхожу снова. Отображены чаты.', function() {
            tester.userName.click();
            tester.logoutButton.click();

            tester.userLogoutRequest().receiveResponse();

            tester.chatsWebSocket.finishDisconnecting();
            tester.employeesWebSocket.finishDisconnecting();

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();
            tester.loginRequest().receiveResponse();

            accountRequest = tester.accountRequest().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent();

            accountRequest.receiveResponse();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            {

                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent();
                const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),
                    employeeRequest = tester.employeeRequest().expectToBeSent();
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent();
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(),
                secondReportsListRequest = tester.reportsListRequest().expectToBeSent(),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent();

                const accountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    expectToBeSent();

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    expectToBeSent();

                chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent();
                let chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(),
                    listRequest = tester.listRequest().expectToBeSent(),
                    siteListRequest = tester.siteListRequest().expectToBeSent(),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(),
                    commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().expectToBeSent(),
                    messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().expectToBeSent();

                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondReportsListRequest.receiveResponse();
                ticketsContactsRequest.receiveResponse();
                chatSettingsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                commonMessageTemplatesRequest.receiveResponse();
                messageTemplatesSettingsRequest.receiveResponse();

                accountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                countersRequest = tester.countersRequest().expectToBeSent();
                const offlineMessageCountersRequest = tester.offlineMessageCountersRequest().expectToBeSent();
                chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent();
                siteListRequest = tester.siteListRequest().expectToBeSent();
                const markListRequest = tester.markListRequest().expectToBeSent();

                chatListRequest = tester.chatListRequest().
                    forCurrentEmployee().
                    expectToBeSent();

                secondChatListRequest = tester.chatListRequest().
                    forCurrentEmployee().
                    active().
                    expectToBeSent();

                thirdChatListRequest = tester.chatListRequest().
                    forCurrentEmployee().
                    closed().
                    expectToBeSent();

                chatChannelTypeListRequest = tester.chatChannelTypeListRequest().expectToBeSent();

                offlineMessageListRequest = tester.offlineMessageListRequest().
                    notProcessed().
                    expectToBeSent();

                processingOfflineMessageListRequest = tester.offlineMessageListRequest().
                    processing().
                    expectToBeSent();

                processedOfflineMessageListRequest = tester.offlineMessageListRequest().
                    processed().
                    expectToBeSent();

                countersRequest.receiveResponse();
                offlineMessageCountersRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                siteListRequest.receiveResponse();
                markListRequest.receiveResponse();

                chatListRequest.receiveResponse();
                secondChatListRequest.receiveResponse();
                thirdChatListRequest.receiveResponse();
                chatChannelTypeListRequest.receiveResponse();
                offlineMessageListRequest.receiveResponse();
                processingOfflineMessageListRequest.receiveResponse();
                processedOfflineMessageListRequest.receiveResponse();

                secondAccountRequest.receiveResponse();
            }
        });
    });
    describe('Открываю новый личный кабинет.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest,
            authenticatedUserRequest,
            registrationRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        it('Используется SSO-авторизация. Совершается запрос токена авторизации.', function() {
            tester = new Tester({
                ...options,
                hasSSOAuth: true,
            });

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();

            accountRequest.receiveResponse();
            
            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().receive();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                applyLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.slavesNotification().
                additional().
                expectToBeSent();

            tester.authTokenRequest().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().ssoAuth().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse(),
            employeeRequest.receiveResponse();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();
            settingsRequest = tester.settingsRequest().ssoAuth().expectToBeSent();

            permissionsRequest.receiveResponse();
            settingsRequest.receiveResponse();

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
            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveUnauthorized();

            registrationRequest = tester.registrationRequest().
                authorization().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                expectToBeSent();

            authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                userDataFetched().
                expectToBeSent();

            reportGroupsRequest.receiveResponse();

            tester.button('Софтфон').click();

            tester.accountRequest().receiveResponse();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            registrationRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();
        });
        it('Используется JWT-авторизация. Запрос токена авторизации не совершается.', function() {
            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();

            accountRequest.receiveResponse();
            
            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().receive();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                applyLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.notificationChannel().
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

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse(),
            employeeRequest.receiveResponse();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();
            settingsRequest = tester.settingsRequest().expectToBeSent();

            permissionsRequest.receiveResponse();
            settingsRequest.receiveResponse();

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
            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveUnauthorized();

            registrationRequest = tester.registrationRequest().
                authorization().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                expectToBeSent();

            authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                userDataFetched().
                expectToBeSent();

            reportGroupsRequest.receiveResponse();

            tester.button('Софтфон').click();

            tester.accountRequest().receiveResponse();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            registrationRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();
        });
    });
});
