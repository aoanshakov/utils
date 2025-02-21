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
        setDocumentVisible,
        broadcastChannels,
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю страницу чатов.', function() {
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
            messageAddingRequest,
            ticketsContactsRequest;

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

            tester.hostBroadcastChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.hostBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.hostBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesWebsocketConnectedMessage().expectToBeSent();
            tester.employeesInitMessage().expectToBeSent();

            {
                const requests = ajax.inAnyOrder();
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),

                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();

                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();
            }

            {
                const requests = ajax.inAnyOrder();

                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                    chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                    listRequest = tester.listRequest().expectToBeSent(requests),
                    siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                    commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().expectToBeSent(requests),
                    messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().expectToBeSent(requests),
                    channelsRequest = tester.channelsRequest().expectToBeSent(requests);

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

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                chatSettingsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                commonMessageTemplatesRequest.receiveResponse();
                messageTemplatesSettingsRequest.receiveResponse();
                channelsRequest.receiveResponse();

                accountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.groupChatsRequest().receiveResponse();
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

                const countersRequest = tester.countersRequest().expectToBeSent();

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

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    receiveResponse();

                secondAccountRequest.receiveResponse();
            }
        });

        xdescribe('Удалось получить контакты для формы обратной связи.', function() {
            beforeEach(function() {
                ticketsContactsRequest.receiveResponse();
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
                    tester.searchResultsRequest().receiveResponse();

                    tester.chatListItem('Сообщение #75').click();

                    tester.chatListRequest().
                        thirdChat().
                        noVisitorName().
                        extIdSpecified().
                        receiveResponse();

                    tester.scheduledMessagesRequest().receiveResponse();

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

                    tester.textarea.pressEnter();
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

                        tester.employeesBroadcastChannel().
                            leaderDeath().
                            expectToBeSent();

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

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.employeesBroadcastChannel().
                        leaderDeath().
                        expectToBeSent();

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

                        tester.employeesBroadcastChannel().
                            leaderDeath().
                            expectToBeSent();

                        tester.button('Войти').click();
                        tester.loginRequest().receiveResponse();

                        tester.accountRequest().
                            webAccountLoginUnavailable().
                            softphoneFeatureFlagDisabled().
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        const employeesBroadcastChannel = tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent();

                        {
                            const requests = ajax.inAnyOrder();

                            const employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);

                            const usersRequest = tester.usersRequest().
                                forContacts().
                                expectToBeSent(requests);

                            const groupsContainingContactRequest = tester.groupsContainingContactRequest().
                                expectToBeSent(requests);

                            const contactGroupsRequest = tester.contactGroupsRequest().expectToBeSent(requests);

                            const secondUsersRequest = tester.usersRequest().
                                forContacts().
                                expectToBeSent(requests);

                            const contactRequest = tester.contactRequest().expectToBeSent(requests);

                            const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                secondEarlier().
                                expectToBeSent(requests);

                            const secondContactGroupsRequest = tester.contactGroupsRequest().expectToBeSent(requests),
                                contactsRequest = tester.contactsRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            employeeStatusesRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();
                            reportsListRequest.receiveResponse();
                            reportTypesRequest.receiveResponse();
                            ticketsContactsRequest.receiveResponse();
                            usersRequest.receiveResponse();
                            groupsContainingContactRequest.receiveResponse();
                            contactGroupsRequest.receiveResponse();
                            secondUsersRequest.receiveResponse();
                            contactCommunicationsRequest.receiveResponse();
                            contactsRequest.receiveResponse();
                            secondContactGroupsRequest.receiveResponse();

                            contactRequest.receiveResponse();
                        }

                        tester.groupsContainingContactRequest().receiveResponse();

                        employeesBroadcastChannel.
                            waitForSecond().
                            applyLeader(). expectToBeSent().
                            waitForSecond().
                            tellIsLeader().expectToBeSent();

                        tester.employeesWebSocket.connect();
                        tester.employeesInitMessage().expectToBeSent();
                        tester.employeesWebsocketConnectedMessage().expectToBeSent();

                        {
                            const contactGroupsRequest = tester.contactGroupsRequest().expectToBeSent(),
                                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),
                                employeeRequest = tester.employeeRequest().expectToBeSent();

                            employeeSettingsRequest.receiveResponse();
                            employeeRequest.receiveResponse();
                        }
                    });
                    it('Отображены контакты.', function() {
                        tester.contactBar.
                            section('ФИО').
                            expectToHaveTextContent('ФИО Бележкова Грета Ервиновна');
                    });
                });
                describe('Токен авторизации истек.', function() {
                    beforeEach(function() {
                        contactsRequest.accessTokenExpired();
                    });

                    describe('Текст статуса не пуст.', function() {
                        let refreshRequest;

                        beforeEach(function() {
                            contactsRequest.receiveResponse();
                            refreshRequest = tester.refreshRequest().expectToBeSent();
                        });

                        describe('Выбираю другой статус. Токен авторизации истек.', function() {
                            beforeEach(function() {
                                tester.userName.click();
                                tester.statusesList.item('Нет на месте').click();

                                tester.employeeUpdatingRequest().
                                    checkAuthorizationHeader().
                                    accessTokenExpired().
                                    receiveResponse();
                            });

                            it('Токен обновлен. Отправлен повторный запрос контактов.', function() {
                                refreshRequest.receiveResponse();
                                const requests = ajax.inAnyOrder();

                                const contactsRequest = tester.contactsRequest().
                                    anotherAuthorizationToken().
                                    expectToBeSent(requests);

                                const employeeUpdatingRequest = tester.employeeUpdatingRequest().
                                    anotherAuthorizationToken().
                                    expectToBeSent(requests);

                                requests.expectToBeSent();

                                contactsRequest.receiveResponse();
                                employeeUpdatingRequest.receiveResponse();
                            });
                            it('Ни один запрос не был отправлен.', function() {
                                ajax.expectNoRequestsToBeSent();
                            });
                        });
                        it('Не удалось обновить токен авторизации.', function() {
                            refreshRequest.
                                refreshTokenExpired().
                                receiveResponse();

                            tester.userLogoutRequest().receiveResponse();

                            tester.chatsWebSocket.finishDisconnecting();
                            tester.employeesWebSocket.finishDisconnecting();

                            tester.employeesBroadcastChannel().
                                leaderDeath().
                                expectToBeSent();

                            tester.input.
                                withFieldLabel('Логин').
                                expectToBeVisible();
                        });
                        it('Токен обновлен. Отправлен повторный запрос контактов.', function() {
                            refreshRequest.receiveResponse();

                            tester.contactsRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.contactList.
                                item('АД Анчева Десислава Пламеновна').
                                expectToBeVisible();
                        });
                    });
                    it('Текст статуса пуст. Токен обновлён. Запрос переотправлен.', function() {
                        contactsRequest.
                            noStatusTest().
                            receiveResponse();

                        tester.refreshRequest().receiveResponse();

                        tester.contactsRequest().
                            anotherAuthorizationToken().
                            receiveResponse();

                        tester.contactList.
                            item('АД Анчева Десислава Пламеновна').
                            expectToBeVisible();
                    });
                });
                it('Токен невалиден. Отключены вебсокеты.', function() {
                    contactsRequest.
                        accessTokenInvalid().
                        receiveResponse();

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.employeesBroadcastChannel().
                        leaderDeath().
                        expectToBeSent();

                    tester.input.
                        withFieldLabel('Логин').
                        expectToBeVisible();
                });
            });
            describe('Выбираю другой статус.', function() {
                let refreshRequest,
                    employeeUpdatingRequest,
                    contactsRequest;

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

                    describe('Не удалось обновить токен авторизации.', function() {
                        beforeEach(function() {
                            refreshRequest.
                                refreshTokenExpired().
                                receiveResponse();

                            tester.userLogoutRequest().receiveResponse();

                            tester.chatsWebSocket.finishDisconnecting();
                            tester.employeesWebSocket.finishDisconnecting();

                            tester.input.withFieldLabel('Логин').fill('botusharova');
                            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                            tester.employeesBroadcastChannel().
                                leaderDeath().
                                expectToBeSent();

                            localStorage.setItem('tokenRefreshing', '');

                            tester.button('Войти').click();
                            tester.loginRequest().receiveResponse();

                            tester.accountRequest().
                                webAccountLoginUnavailable().
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent();

                            tester.masterInfoMessage().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.masterInfoMessage().
                                applyLeader().
                                expectToBeSent();

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

                            tester.employeesWebSocket.connect();
                            tester.employeesInitMessage().expectToBeSent();
                            tester.employeesWebsocketConnectedMessage().expectToBeSent();

                            requests = ajax.inAnyOrder();

                            const employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
                            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                                secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);

                            const accountRequest = tester.accountRequest().
                                forChats().
                                webAccountLoginUnavailable().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            const secondAccountRequest = tester.accountRequest().
                                forChats().
                                webAccountLoginUnavailable().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);

                            const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                                listRequest = tester.listRequest().expectToBeSent(requests),
                                siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                                commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().
                                    expectToBeSent(requests),
                                messageTemplateListRequest = tester.messageTemplateListRequest().
                                    expectToBeSent(requests);

                            const messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().
                                expectToBeSent(requests);
         
                            const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                                channelsRequest = tester.channelsRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            employeeStatusesRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();
                            reportsListRequest.receiveResponse();
                            reportTypesRequest.receiveResponse();
                            secondReportsListRequest.receiveResponse();
                            ticketsContactsRequest.receiveResponse();
                            chatSettingsRequest.receiveResponse();
                            chatChannelListRequest.receiveResponse();
                            listRequest.receiveResponse();
                            siteListRequest.receiveResponse();
                            commonMessageTemplatesRequest.receiveResponse();
                            messageTemplateListRequest.receiveResponse();
                            messageTemplatesSettingsRequest.receiveResponse();
                            employeeSettingsRequest.receiveResponse();
                            employeeRequest.receiveResponse();
                            channelsRequest.receiveResponse();

                            accountRequest.receiveResponse();

                            tester.chatsWebSocket.connect();
                            tester.chatsInitMessage().expectToBeSent();

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.groupChatsRequest().receiveResponse();
                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();

                            tester.countersRequest().receiveResponse();

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

                            tester.chatChannelSearchRequest().
                                emptySearchString().
                                receiveResponse();

                            chatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();

                            secondAccountRequest.receiveResponse();
                            authCheckRequest.receiveResponse();

                            tester.talkOptionsRequest().receiveResponse();
                            tester.permissionsRequest().receiveResponse();
                            tester.settingsRequest().receiveResponse();

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
                            tester.marksRequest().receiveResponse();
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

                            registrationRequest.receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();

                            tester.userName.click();
                            tester.statusesList.item('Нет на месте').click();

                            tester.employeeUpdatingRequest().
                                checkAuthorizationHeader().
                                accessTokenExpired().
                                receiveResponse();

                            tester.refreshRequest().receiveResponse();

                            tester.employeeUpdatingRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.button('Софтфон').click();

                            tester.accountRequest().
                                webAccountLoginUnavailable().
                                operatorWorkplaceAvailable().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.slavesNotification().
                                additional().
                                visible().
                                expectToBeSent();
                        });

                        describe('Открываю историю звонков. Токен истёк.', function() {
                            let refreshRequest;

                            beforeEach(function() {
                                tester.callsHistoryButton.click();

                                tester.callsRequest().
                                    accessTokenExpired().
                                    anotherAuthorizationToken().
                                    checkAuthorizationHeader().
                                    receiveResponse();

                                refreshRequest = tester.refreshRequest().
                                    anotherAuthorizationToken().
                                    expectToBeSent();
                            });

                            it('Не удалось обновить токен авторизации.', function() {
                                refreshRequest.
                                    refreshTokenExpired().
                                    receiveResponse();

                                tester.userLogoutRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.chatsWebSocket.finishDisconnecting();
                                tester.employeesWebSocket.finishDisconnecting();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    microphoneAccessGranted().
                                    destroyed().
                                    enabled().
                                    expectToBeSent();

                                tester.employeesBroadcastChannel().
                                    leaderDeath().
                                    expectToBeSent();

                                tester.masterInfoMessage().
                                    leaderDeath().
                                    expectToBeSent();

                                tester.authLogoutRequest().
                                    dontCheckAuthorizationHeader().
                                    receiveResponse();

                                tester.eventsWebSocket.finishDisconnecting();

                                tester.registrationRequest().
                                    expired().
                                    receiveResponse();

                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.input.
                                    withFieldLabel('Логин').
                                    expectToBeVisible();
                            });
                            it('Токен обновлён. Запрос переотправлен.', function() {
                                refreshRequest.receiveResponse();

                                tester.callsRequest().
                                    thirdAuthorizationToken().
                                    checkAuthorizationHeader().
                                    receiveResponse();

                                tester.header.userName.click();
                                tester.statusesList.item('Нет на работе').click();

                                tester.employeeUpdatingRequest().
                                    thirdAuthorizationToken().
                                    anotherStatus().
                                    receiveResponse();
                            });
                        });
                        it('На другой вкладке обновился токен авторизации.', function() {
                            tester.changeAuthTokenCookie();
                            tester.callsHistoryButton.click();

                            tester.callsRequest().
                                thirdAuthorizationToken().
                                checkAuthorizationHeader().
                                receiveResponse();
                        });
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

                    tester.userLogoutRequest().receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();

                    tester.employeesBroadcastChannel().
                        leaderDeath().
                        expectToBeSent();

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

                tester.employeesBroadcastChannel().
                    leaderDeath().
                    expectToBeSent();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.loginRequest().receiveResponse();

                tester.accountRequest().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                {
                    const employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(),
                        reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(),
                        reportsListRequest = tester.reportsListRequest().expectToBeSent(),
                        reportTypesRequest = tester.reportTypesRequest().expectToBeSent(),
                        secondReportsListRequest = tester.reportsListRequest().expectToBeSent(),
                        ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(),
                        chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(),
                        channelsRequest = tester.channelsRequest().expectToBeSent(),
                        chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(),
                        listRequest = tester.listRequest().expectToBeSent(),
                        siteListRequest = tester.siteListRequest().expectToBeSent(),
                        messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(),
                        commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().expectToBeSent(),
                        messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().expectToBeSent();

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

                    employeeStatusesRequest.receiveResponse();
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
                    channelsRequest.receiveResponse();

                    accountRequest.receiveResponse();

                    tester.chatsWebSocket.connect();
                    tester.chatsInitMessage().expectToBeSent();

                    {
                        const offlineMessageCountersRequest = tester.offlineMessageCountersRequest().expectToBeSent(),
                            chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(),
                            siteListRequest = tester.siteListRequest().expectToBeSent(),
                            markListRequest = tester.markListRequest().expectToBeSent(),
                            groupChatsRequest = tester.groupChatsRequest().expectToBeSent(),
                            chatChannelTypeListRequest = tester.chatChannelTypeListRequest().expectToBeSent();

                        const offlineMessageListRequest = tester.offlineMessageListRequest().
                            notProcessed().
                            expectToBeSent();

                        const processingOfflineMessageListRequest = tester.offlineMessageListRequest().
                            processing().
                            expectToBeSent();

                        const processedOfflineMessageListRequest = tester.offlineMessageListRequest().
                            processed().
                            expectToBeSent();

                        const countersRequest = tester.countersRequest().expectToBeSent();

                        const chatListRequest = tester.chatListRequest().
                            forCurrentEmployee().
                            expectToBeSent();

                        const secondChatListRequest = tester.chatListRequest().
                            forCurrentEmployee().
                            active().
                            expectToBeSent();

                        const thirdChatListRequest = tester.chatListRequest().
                            forCurrentEmployee().
                            closed().
                            expectToBeSent();

                        const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                            emptySearchString().
                            expectToBeSent();

                        offlineMessageCountersRequest.receiveResponse();
                        chatChannelListRequest.receiveResponse();
                        siteListRequest.receiveResponse();
                        markListRequest.receiveResponse();
                        groupChatsRequest.receiveResponse();
                        chatChannelTypeListRequest.receiveResponse();
                        offlineMessageListRequest.receiveResponse();
                        processingOfflineMessageListRequest.receiveResponse();
                        processedOfflineMessageListRequest.receiveResponse()
                        countersRequest.receiveResponse();
                        chatListRequest.receiveResponse();
                        secondChatListRequest.receiveResponse();
                        thirdChatListRequest.receiveResponse();
                        chatChannelSearchRequest.receiveResponse();
                    }

                    secondAccountRequest.receiveResponse();
                }
            });
        });
        describe('Токен авторизации истёк.', function() {
            let refreshRequest;

            beforeEach(function() {
                ticketsContactsRequest.
                    accessTokenExpired().
                    receiveResponse();

                refreshRequest = tester.refreshRequest().expectToBeSent();
            });

            xit('Не удалось обновить токен авторизации.', function() {
                refreshRequest.
                    refreshTokenExpired().
                    receiveResponse();

                tester.userLogoutRequest().receiveResponse();

                tester.chatsWebSocket.finishDisconnecting();
                tester.employeesWebSocket.finishDisconnecting();

                tester.employeesBroadcastChannel().
                    leaderDeath().
                    expectToBeSent();

                tester.input.
                    withFieldLabel('Логин').
                    expectToBeVisible();
            });
            it('Удалось обновить токен авторизации. Сообщение отправлено.', function() {
                refreshRequest.receiveResponse();
                tester.ticketsContactsRequest().receiveResponse();
            });
        });
        return;
        it('Токен невалиден. Отключены вебсокеты.', function() {
            ticketsContactsRequest.
                accessTokenInvalid().
                receiveResponse();

            tester.userLogoutRequest().receiveResponse();

            tester.chatsWebSocket.finishDisconnecting();
            tester.employeesWebSocket.finishDisconnecting();

            tester.employeesBroadcastChannel().
                leaderDeath().
                expectToBeSent();

            tester.input.
                withFieldLabel('Логин').
                expectToBeVisible();
        });
    });
    return;
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

        describe('Используется SSO-авторизация. Совершается запрос токена авторизации.', function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    hasSSOAuth: true,
                });

                tester.ssoCheckRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();
                tester.apiLoginRequest().receiveResponse();

                tester.accountRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.ticketsContactsRequest().receiveResponse();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                {
                    const requests = ajax.inAnyOrder();

                    const reportGroupsRequest = tester.reportGroupsRequest().
                        noAuthorizationHeader().
                        expectToBeSent(requests);

                    const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                        reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                        authTokenRequest = tester.authTokenRequest().expectToBeSent(requests);

                    const employeeStatusesRequest = tester.employeeStatusesRequest().
                        noAuthorizationHeader().
                        expectToBeSent(requests);

                    tester.ssoWsCheckingRequest().receiveResponse();
                    tester.ssoWsCheckingRequest().receiveResponse();

                    requests.expectToBeSent();

                    reportGroupsRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                    reportTypesRequest.receiveResponse();
                    authTokenRequest.receiveResponse();
                }

                tester.authCheckRequest().
                    ssoAuth().
                    receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                const settingsRequest = tester.settingsRequest().
                    ssoAuth().
                    expectToBeSent();

                spendTime(1000);
 
                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.hostBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.employeesWebSocket.
                    ssoAuth().
                    connect();

                tester.employeesWebsocketConnectedMessage().expectToBeSent();
                
                {
                    const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent();

                    const employeeRequest = tester.employeeRequest().
                        noAuthorizationHeader().
                        expectToBeSent();

                    tester.employeesInitMessage().
                        ssoAuth().
                        expectToBeSent();

                    employeeSettingsRequest.receiveResponse();
                    employeeRequest.receiveResponse();
                }

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
                tester.marksRequest().receiveResponse();
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

                registrationRequest.receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();
            });

            describe('Выхожу из аккаунта.', function() {
                beforeEach(function() {
                    tester.header.userName.click();
                    tester.logoutButton.click();

                    tester.apiLogoutRequest().receiveResponse();

                    tester.employeesWebSocket.finishDisconnecting();
                    tester.eventsWebSocket.finishDisconnecting();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        microphoneAccessGranted().
                        destroyed().
                        enabled().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        leaderDeath().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        leaderDeath().
                        expectToBeSent();

                    tester.authLogoutRequest().
                        ssoAuth().
                        receiveResponse();

                    tester.registrationRequest().
                        expired().
                        receiveResponse();

                    spendTime(2000);
                    tester.webrtcWebsocket.finishDisconnecting();
                });

                it('Вхожу в аккаунт. Открываю софтфон. Софтфон видим.', function() {
                    tester.input.withFieldLabel('Логин').fill('botusharova');
                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                    tester.button('Войти').click();

                    tester.apiLoginRequest().receiveResponse();

                    tester.accountRequest().
                        noAuthorizationHeader().
                        receiveResponse();

                    const employeesBroadcastChannel = tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        applyLeader().
                        expectToBeSent();

                    {
                        const requests = ajax.inAnyOrder();

                        const reportGroupsRequest = tester.reportGroupsRequest().
                            noAuthorizationHeader().
                            expectToBeSent(requests);

                        const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                            authTokenRequest = tester.authTokenRequest().expectToBeSent(requests);

                        requests.expectToBeSent();
                        
                        tester.ssoWsCheckingRequest().receiveResponse();
                        tester.ssoWsCheckingRequest().receiveResponse();

                        reportsListRequest.receiveResponse();

                        const employeeStatusesRequest = tester.employeeStatusesRequest().
                            noAuthorizationHeader().
                            expectToBeSent();

                        tester.ticketsContactsRequest().receiveResponse();

                        reportGroupsRequest.receiveResponse();
                        reportTypesRequest.receiveResponse();
                        authTokenRequest.receiveResponse();

                        tester.authCheckRequest().
                            ssoAuth().
                            receiveResponse();

                        tester.talkOptionsRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();

                        const settingsRequest = tester.settingsRequest().
                            ssoAuth().
                            expectToBeSent();

                        employeeStatusesRequest.receiveResponse();
                        employeesBroadcastChannel.waitForSecond();

                        employeesBroadcastChannel.
                            applyLeader().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        employeesBroadcastChannel.
                            tellIsLeader().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            tellIsLeader().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.employeesWebSocket.connect();

                        tester.employeesInitMessage().
                            ssoAuth().
                            expectToBeSent();

                        tester.employeesWebsocketConnectedMessage().expectToBeSent();
                        const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent();

                        const employeeRequest = tester.employeeRequest().
                            noAuthorizationHeader().
                            expectToBeSent();

                        employeeSettingsRequest.receiveResponse();
                        employeeRequest.receiveResponse();
                        settingsRequest.receiveResponse();
                    }

                    tester.slavesNotification().
                        enabled().
                        twoChannels().
                        expectToBeSent();

                    tester.connectEventsWebSocket(1);

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.connectSIPWebSocket(1);

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    tester.marksRequest().receiveResponse();
                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                    tester.registrationRequest().receiveUnauthorized();

                    registrationRequest = tester.registrationRequest().
                        authorization().
                        expectToBeSent();

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });
                it('Отображена форма входа.', function() {
                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                });
            });
            it('Открываю софтфон. Софтфон видим.', function() {
                tester.button('Софтфон').click();

                tester.accountRequest().
                    noAuthorizationHeader().
                    receiveResponse();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();
            });
        });
        describe('Используется JWT-авторизация. Запрос токена авторизации не совершается.', function() {
            let settingsRequest;

            beforeEach(function() {
                tester = new Tester(options);

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.hostBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();
                
                {
                    const requests = ajax.inAnyOrder();

                    const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                        reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                        reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                        reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                        employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

                    ticketsContactsRequest.receiveResponse();
                    reportGroupsRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                    reportTypesRequest.receiveResponse();
                    employeeStatusesRequest.receiveResponse();

                    authCheckRequest.receiveResponse();
                }

                {
                    const talkOptionsRequest = tester.talkOptionsRequest().expectToBeSent(),
                        permissionsRequest = tester.permissionsRequest().expectToBeSent();

                    talkOptionsRequest.receiveResponse();
                    permissionsRequest.receiveResponse();

                    settingsRequest = tester.settingsRequest().expectToBeSent();
                }
            });

            describe('Вкладка является ведущей.', function() {
                let employeeSettingsRequest;

                beforeEach(function() {
                    spendTime(1000);

                    tester.hostBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        applyLeader().
                        expectToBeSent();

                    tester.notificationChannel().
                        applyLeader().
                        expectToBeSent().
                        waitForSecond();

                    tester.hostBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        expectToBeSent();

                    tester.notificationChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.employeesWebSocket.connect();
                    tester.employeesWebsocketConnectedMessage().expectToBeSent();
                    tester.employeesInitMessage().expectToBeSent();

                    {

                        employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent();
                        const employeeRequest = tester.employeeRequest().expectToBeSent();

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

                        employeeRequest.receiveResponse();
                        tester.marksRequest().receiveResponse();
                        const authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                        tester.registrationRequest().receiveUnauthorized();

                        const registrationRequest = tester.registrationRequest().
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

                        registrationRequest.receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            expectToBeSent();
                    }
                });

                describe('Выхожу из аккаунта.', function() {
                    beforeEach(function() {
                        employeeSettingsRequest.receiveResponse();

                        tester.header.userName.click();
                        tester.logoutButton.click();

                        tester.userLogoutRequest().receiveResponse();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            microphoneAccessGranted().
                            destroyed().
                            enabled().
                            expectToBeSent();

                        tester.employeesBroadcastChannel().
                            leaderDeath().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            leaderDeath().
                            expectToBeSent();

                        tester.authLogoutRequest().
                            dontCheckAuthorizationHeader().
                            receiveResponse();

                        tester.employeesWebSocket.finishDisconnecting();
                        tester.eventsWebSocket.finishDisconnecting();

                        tester.registrationRequest().expired().receiveResponse();

                        spendTime(2000);
                        tester.webrtcWebsocket.finishDisconnecting();
                    });

                    it('Вхожу в аккаунт. Открываю софтфон. Софтфон видим.', function() {
                        tester.input.withFieldLabel('Логин').fill('botusharova');
                        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                        tester.button('Войти').click();

                        tester.loginRequest().receiveResponse();
                        tester.accountRequest().receiveResponse();

                        const employeesBroadcastChannel = tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent();

                        {
                            let requests = ajax.inAnyOrder();

                            const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            reportGroupsRequest.receiveResponse();
                            reportsListRequest.receiveResponse();
                            reportTypesRequest.receiveResponse();

                            requests = ajax.inAnyOrder();

                            const employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            employeeStatusesRequest.receiveResponse();
                            ticketsContactsRequest.receiveResponse();
     
                            authCheckRequest.receiveResponse();

                            const talkOptionsRequest = tester.talkOptionsRequest().expectToBeSent(),
                                permissionsRequest = tester.permissionsRequest().expectToBeSent();

                            talkOptionsRequest.receiveResponse();
                            permissionsRequest.receiveResponse();

                            const settingsRequest = tester.settingsRequest().expectToBeSent();
                            employeesBroadcastChannel.waitForSecond();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.masterInfoMessage().
                                applyLeader().
                                expectToBeSent();

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

                            tester.employeesWebSocket.connect();
                            tester.employeesWebsocketConnectedMessage().expectToBeSent();
                            tester.employeesInitMessage().expectToBeSent();

                            const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),
                                employeeRequest = tester.employeeRequest().expectToBeSent();

                            employeeSettingsRequest.receiveResponse();
                            employeeRequest.receiveResponse();

                            settingsRequest.receiveResponse();

                            tester.slavesNotification().
                                enabled().
                                twoChannels().
                                expectToBeSent();

                            tester.connectEventsWebSocket(1);

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket(1);

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.marksRequest().receiveResponse();
                            const authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            tester.registrationRequest().receiveUnauthorized();

                            const registrationRequest = tester.registrationRequest().
                                authorization().
                                expectToBeSent();

                            authenticatedUserRequest.receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                microphoneAccessGranted().
                                userDataFetched().
                                expectToBeSent();

                            registrationRequest.receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
                        }

                        tester.button('Софтфон').click();
                        tester.accountRequest().receiveResponse();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();
                    });
                    it('Отображена форма входа.', function() {
                        tester.input.withFieldLabel('Логин').expectToBeVisible();
                    });
                });
                describe('Открываю софтфон. Нажимаю на кнопку адресной книги.', function() {
                    let refreshRequest,
                        usersInGroupsRequest,
                        usersRequest,
                        groupsRequest;

                    beforeEach(function() {
                        //localStorage.setItem('tokenRefreshingDebugMode', '1');

                        tester.button('Софтфон').click();
                        tester.accountRequest().receiveResponse();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.addressBookButton.click();

                        usersRequest = tester.usersRequest().expectToBeSent();
                        usersInGroupsRequest = tester.usersInGroupsRequest().expectToBeSent();
                        groupsRequest = tester.groupsRequest().expectToBeSent();
                    });

                    describe(
                        'В ответ на запросы, отправленные в бэк софтфтона пришло сообщение об истечении токена.',
                    function() {
                        beforeEach(function() {
                            usersRequest.
                                accessTokenExpired().
                                receiveResponse();

                            refreshRequest = tester.refreshRequest().expectToBeSent();

                            groupsRequest.
                                accessTokenExpired().
                                receiveResponse();
                        });

                        describe('Токен обновился. Запросы переотправлены.', function() {
                            beforeEach(function() {
                                refreshRequest.receiveResponse();

                                tester.usersRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.groupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();
                            });

                            it(
                                'Получен ответ на запрос с токеном, который истёк и уже был обновлён. Запрос ' +
                                'переотправлен.',
                            function() {
                                usersInGroupsRequest.
                                    accessTokenExpired().
                                    receiveResponse();

                                tester.usersInGroupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                            it('Ни один запрос не был отправлен.', function() {
                                ajax.expectNoRequestsToBeSent();
                            });
                        });
                        it('Ни один запрос не был отправлен.', function() {
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                    describe(
                        'В ответ на запросы, отправленные в бэк софтфтона и в бэк сотрудников пришло сообщение об ' +
                        'истечении токена.',
                    function() {
                        beforeEach(function() {
                            employeeSettingsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            refreshRequest = tester.refreshRequest().expectToBeSent();

                            usersRequest.
                                accessTokenExpired().
                                receiveResponse();

                            groupsRequest.
                                accessTokenExpired().
                                receiveResponse();
                        });

                        describe('Токен обновился. Запросы переотправлены.', function() {
                            beforeEach(function() {
                                refreshRequest.receiveResponse();

                                tester.employeeSettingsRequest().receiveResponse();

                                tester.usersRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.groupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();
                            });

                            it(
                                'Получен ответ на запрос с токеном, который истёк и уже был обновлён. Запрос ' +
                                'переотправлен.',
                            function() {
                                usersInGroupsRequest.
                                    accessTokenExpired().
                                    receiveResponse();

                                tester.usersInGroupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                            it('Ни один запрос не был отправлен.', function() {
                                ajax.expectNoRequestsToBeSent();
                            });
                        });
                        it('Ни один запрос не был отправлен.', function() {
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                    describe(
                        'На другой вкладке было запрошено обновление токена. В ответ на запросы, отправленные в бэк ' +
                        'софтфтона пришло сообщение об истечении токена.',
                    function() {
                        beforeEach(function() {
                            localStorage.setItemInAnotherTab('tokenRefreshing', JSON.stringify({
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                                state: 'refreshing'
                            }));

                            usersRequest.
                                accessTokenExpired().
                                receiveResponse();

                            groupsRequest.
                                accessTokenExpired().
                                receiveResponse();
                        });

                        describe('Токен обновился. Запросы переотправлены.', function() {
                            beforeEach(function() {
                                tester.setAnotherAuthTokenCookie();

                                localStorage.setItemInAnotherTab('tokenRefreshing', JSON.stringify({
                                    token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                                    state: 'refreshed'
                                }));

                                tester.usersRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.groupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();
                            });

                            it(
                                'Получен ответ на запрос с токеном, который истёк и уже был обновлён. Запрос ' +
                                'переотправлен.',
                            function() {
                                usersInGroupsRequest.
                                    accessTokenExpired().
                                    receiveResponse();

                                tester.usersInGroupsRequest().
                                    anotherAuthorizationToken().
                                    receiveResponse();

                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                            it('Ни один запрос не был отправлен.', function() {
                                ajax.expectNoRequestsToBeSent();
                            });
                        });
                        it('Ни один запрос не был отправлен.', function() {
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                    /*
                    describe('Токен истёк на другой вкладке.', function() {
                        let leaderTokenRefreshingRequest;

                        beforeEach(function() {
                            leaderTokenRefreshingRequest = tester.leaderTokenRefreshingRequest().receive();
                            refreshRequest = tester.refreshRequest().expectToBeSent();

                            usersRequest.
                                accessTokenExpired().
                                receiveResponse();

                            groupsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            usersInGroupsRequest.
                                accessTokenExpired().
                                receiveResponse();
                        });

                        describe('Токен обновлён на другой вкладке.', function() {
                            beforeEach(function() {
                                refreshRequest.receiveResponse();
                                leaderTokenRefreshingRequest.expectResponseToBeSent();

                                tester.usersRequest().receiveResponse();
                                tester.groupsRequest().receiveResponse();
                                tester.usersInGroupsRequest().receiveResponse();
                            });

                            it(
                                'Получен запрос обновления токена, который уже был обновлён. Отправлен ответ.',
                            function() {
                                tester.leaderTokenRefreshingRequest().
                                    anotherId().
                                    expectResponseToBeSent();
                            });
                            it('Отображена таблица сотрудников.', function() {
                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                        });
                        it('Ни один запрос не был отправлен.', function() {
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                    */
                });
            });
            /*
            describe('Вкладка является ведомой. Токен истёк.', function() {
                let refreshRequest,
                    usersInGroupsRequest,
                    usersRequest,
                    groupsRequest,
                    leaderTokenRefreshingRequest,
                    secondLeaderTokenRefreshingRequest;

                beforeEach(function() {
                    tester.notificationChannel().
                        tellIsLeader().
                        receive();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        receive();

                    tester.hostBroadcastChannel().
                        tellIsLeader().
                        receive();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        receive();

                    tester.employeesWebsocketConnectedRequest().expectToBeSent();

                    tester.masterNotification().
                        tabOpened().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        receive();

                    tester.employeesWebsocketConnectedMessage().receive();

                    const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),
                        employeeRequest = tester.employeeRequest().expectToBeSent();

                    employeeSettingsRequest.receiveResponse();
                    employeeRequest.receiveResponse();

                    settingsRequest.receiveResponse();
                    tester.marksRequest().receiveResponse();
                    tester.authenticatedUserRequest().receiveResponse();
                    notificationTester.grantPermission();

                    tester.button('Софтфон').click();

                    tester.masterNotification().
                        toggleWidgetVisiblity().
                        expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        visible().
                        receive();

                    tester.accountRequest().receiveResponse();
                    tester.addressBookButton.click();

                    usersRequest = tester.usersRequest().expectToBeSent();
                    tester.usersInGroupsRequest().receiveResponse();
                    groupsRequest = tester.groupsRequest().expectToBeSent();

                    usersRequest.
                        accessTokenExpired().
                        receiveResponse();

                    leaderTokenRefreshingRequest = tester.leaderTokenRefreshingRequest().expectToBeSent();
                    tester.setAnotherUuid();

                    groupsRequest.
                        accessTokenExpired().
                        receiveResponse();

                    secondLeaderTokenRefreshingRequest = tester.leaderTokenRefreshingRequest().
                        anotherId().
                        expectToBeSent();
                });

                it('Токен обновился. Запросы переотправлены.', function() {
                    tester.setAnotherAuthTokenCookie();
                    leaderTokenRefreshingRequest.receiveResponse();

                    tester.usersRequest().
                        anotherAuthorizationToken().
                        receiveResponse();

                    secondLeaderTokenRefreshingRequest.receiveResponse();

                    tester.groupsRequest().
                        anotherAuthorizationToken().
                        receiveResponse();

                    tester.softphone.expectToHaveTextContent(
                        'Сотрудники Группы ' +

                        'Божилова Йовка 296 ' +
                        'Господинова Николина 295 ' +
                        'Шалева Дора 8258'
                    );
                });
                it('Проходит некоторое время. Запросы переотправлены.', function() {
                    spendTime(10000);

                    tester.notificationChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        applyLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.hostBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.usersRequest().expectToBeSent();
                    tester.groupsRequest().expectToBeSent();
                });
                it('Ни один запрос не был отправлен.', function() {
                    ajax.expectNoRequestsToBeSent();
                });
            });
            */
        });
    });
});
