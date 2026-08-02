tests.addTest(options => {
   const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        unfilteredPostMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
        fileReader,
        ajax,
    } = options;

    describe('Включено расширение Chrome.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            tester.restoreSoftphoneIFrameContentWindow();
            tester.restoreNotificationIFrameContentWindow();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                background.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                popup.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();

            tester.chrome.
                permissions.
                nextRequest().
                expectNotToExist();
        });

        xdescribe('Открываю IFrame чатов amoCRM.', function() {
            let accountRequest,
                secondAccountRequest,
                salesbotChannelsRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmChatsIframeContent',
                    isIframe: true,
                    isAuthorized: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.unreadMessagesCountSettingRequest().expectToBeSent();
            });

            describe('Получено состояние виджета amoCRM.', function() {
                beforeEach(function() {
                    tester.amocrmStateSettingRequest().
                        chats().
                        receive();

                    tester.tokenInitializationRequest().
                        chats().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });

                    tester.widgetSettings().
                        amocrm().
                        chatsSettings().
                        request().
                        receiveResponse();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });

                    tester.submoduleInitilizationEvent().
                        contacts().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().expectToBeSent();

                    tester.sourcesSettingRequest().
                        employeeUnknown().
                        expectToBeSent();

                    tester.availabilitySettingRequest().
                        chats().
                        expectToBeSent();

                    salesbotChannelsRequest = tester.salesbotChannelsRequest().receive();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.channelsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();
                    tester.settingsAppRequest().receiveResponse();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();
                });

                describe('Удалось получить данные аккаунта.', function() {
                    let offlineMessageListRequest;

                    beforeEach(function() {
                        accountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain('Window message received').
                            expectMessageToContain('{"method":"get_salesbot_channels"}');

                        tester.sourcesSettingRequest().
                            employeeUnknown().
                            expectToBeSent();

                        tester.sourcesSettingRequest().expectToBeSent();

                        tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.employeesBroadcastChannel().
                            tellIsLeader().
                            expectToBeSent();

                        tester.employeesWebSocket.connect();
                        tester.employeesWebsocketConnectedMessage().expectToBeSent();

                        tester.employeesInitMessage().
                            oauthToken().
                            expectToBeSent();

                        secondAccountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.chatsWebSocket.connect();

                        tester.chatsInitMessage().
                            oauthToken().
                            expectToBeSent();

                        tester.usersRequest().
                            forContacts().
                            forIframe().
                            receiveResponse();

                        const requests = ajax.inAnyOrder();

                        const employeeSettingsRequest = tester.employeeSettingsRequest().
                            expectToBeSent(requests);

                        const employeeRequest = tester.employeeRequest().
                            oauthToken().
                            expectToBeSent(requests);

                        const thirdAccountRequest = tester.accountRequest().
                            forIframe().
                            fromIframe().
                            webAccountLoginUnavailable().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        requests.expectToBeSent();

                        thirdAccountRequest.receiveResponse();
                        employeeSettingsRequest.receiveResponse();
                        employeeRequest.receiveResponse();

                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.groupChatsRequest().receiveResponse();
                        tester.chatChannelTypeListRequest().receiveResponse();
                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
         
                        tester.countersRequest().
                            noNewChats().
                            noClosedChats().
                            receiveResponse();

                        tester.unreadMessagesCountSettingRequest().
                            value(75).
                            expectToBeSent();

                        tester.tagsRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            noData().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            active().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            closed().
                            noData().
                            receiveResponse();

                        tester.chatChannelSearchRequest().
                            emptySearchString().
                            receiveResponse();

                        tester.offlineMessageListRequest().processing().receiveResponse();

                        offlineMessageListRequest = tester.offlineMessageListRequest().
                            processed().
                            expectToBeSent();
                    });

                    describe('Получен список заявок.', function() {
                        beforeEach(function() {
                            offlineMessageListRequest.receiveResponse();
                            salesbotChannelsRequest.expectResponseToBeSent();
                        });

                        describe('Получен запрос открытия чата.', function() {
                            let chatChannelSearchRequest;

                            beforeEach(function() {
                                tester.chatOpeningRequest().receive();

                                tester.visitorExternalSearchingRequest().
                                    anotherToken().
                                    fourthSearchString().
                                    telegramPrivate().
                                    receiveResponse();

                                chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                    thirdSearchString().
                                    telegramPrivate().
                                    expectToBeSent();
                            });

                            it(
                                'Не удалось найти чат из-за того, что сотрудник стал неавторизованным. Совершён выход.',
                            function() {
                                chatChannelSearchRequest.
                                    unauthorized().
                                    receiveResponse();

                                postMessages.nextMessage().expectMessageToContain({
                                    method: 'set_token',
                                    data: '',
                                });

                                tester.unreadMessagesCountSettingRequest().expectToBeSent();

                                tester.employeesWebSocket.finishDisconnecting();
                                tester.chatsWebSocket.finishDisconnecting();

                                tester.employeesBroadcastChannel().
                                    leaderDeath().
                                    expectToBeSent();
                            });
                            it(
                                'Найденный чат принят другим сотрудником, к чатам которого у авторизованного сотурдника ' +
                                'нет доступа.',
                            function() {
                                chatChannelSearchRequest.
                                    anotherEmployee().
                                    chatUnavailable().
                                    receiveResponse();

                                tester.notificationSection.expectToHaveTextContent(
                                    'Ошибка открытия чата ' +
                                    'По этим контактным данным уже был создан чат другим оператором',
                                );
                            });
                            it('Чат не был найден. Создан новый чат. Открыт новый чат.', function() {
                                chatChannelSearchRequest.
                                    noChat().
                                    receiveResponse();

                                tester.groupChatsRequest().receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    noData().
                                    receiveResponse();

                                tester.chatListRequest().
                                    active().
                                    secondPage().
                                    forCurrentEmployee().
                                    receiveResponse();

                                tester.chatListRequest().
                                    closed().
                                    noData().
                                    forCurrentEmployee().
                                    receiveResponse();

                                tester.chatListRequest().
                                    active().
                                    noData().
                                    forCurrentEmployee().
                                    isOtherEmployeesAppeals().
                                    receiveResponse();

                                tester.chatStartingRequest().
                                    anotherPhone().
                                    receiveResponse();

                                tester.chatListRequest().
                                    thirdChat().
                                    assignedToCurrentEmployee().
                                    receiveResponse();

                                tester.scheduledMessagesRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.chatInfoRequest().receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.chatListRequest().
                                    thirdChat().
                                    assignedToCurrentEmployee().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();
                            });
                        });
                        describe('Нажимаю на кнопку аккаунта.', function() {
                            beforeEach(function() {
                                tester.accountButton.click();
                            });

                            it('Получен короткий номер сотрудника.', function() {
                                tester.shortPhoneSettingRequest().
                                    userDataFetched().
                                    receive();

                                tester.body.expectTextContentToHaveSubstring(
                                    'k karadimova ' +
                                    'Внутренний номер: 9119 ' +

                                    'Доступен'
                                );
                            });
                            it('Нажимаю на кнопку выхода. Производится выход.', function() {
                                tester.button('Выход').click();
                                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/ru/logout');
                            });
                            it('Отображено имя сотрудника.', function() {
                                tester.body.expectTextContentToHaveSubstring(
                                    'k karadimova ' +
                                    'Доступен'
                                );
                            });
                        });
                        describe('Получен запрос прикладывания файла.', function() {
                            let fileUploadngRequest,
                                resourceRequest;

                            beforeEach(function() {
                                fileUploadngRequest = tester.fileUploadngRequest().receive();

                                resourceRequest = tester.resourceRequest().
                                    thumbs().
                                    expectToBeSent();
                            });

                            it('Не удалось выгрузить файл. Ответ отправлен в родительское окно.', function() {
                                resourceRequest.
                                    failed().
                                    receiveResponse();
                                    
                                fileUploadngRequest.
                                    failed().
                                    expectResponseToBeSent();
                            });
                            it('Ответ отправлен в родительское окно.', function() {
                                resourceRequest.receiveResponse();
                                fileUploadngRequest.expectResponseToBeSent();
                            });
                        });
                        it('Получен запрос скачивания файла.', function() {
                            tester.fileDownloadingRequest().receive();

                            tester.resourcePayloadRequest().
                                thirdFile().
                                receiveResponse();

                            tester.downloadedFile.
                                expectToHaveName('some-file.zip').
                                expectToHaveContent('2gf0s82l24348s982');
                        });
                        it('Получен запрос шаблонов WABA. Список шаблонов отправлен в родительское окно.', function() {
                            const messageTemplatesRequest = tester.messageTemplatesRequest().receive();

                            tester.channelMessageTemplateListRequest().receiveResponse();
                            messageTemplatesRequest.expectResponseToBeSent();
                        });
                        it(
                            'Полчен запрос присутствующего фичефлага. Значение фичефлага отправлено в родительское ' +
                            'окно.',
                        function() {
                            tester.featureFlagRequest().
                                featureFlag('chat_pinning').
                                expectResponseToBeSent();
                        });
                        it(
                            'Полчен запрос отсутствующего фичефлага. Значение фичефлага отправлено в родительское ' +
                            'окно.',
                        function() {
                            tester.featureFlagRequest().
                                featureFlag('some_feature').
                                unavailable().
                                expectResponseToBeSent();
                        });
                        it('Получен запрос открытия чата из несуществующего канала.', function() {
                            tester.chatOpeningRequest().
                                fourthChannel().
                                receive();

                            tester.visitorExternalSearchingRequest().
                                anotherToken().
                                fourthSearchString().
                                telegramPrivate().
                                receiveResponse();

                            tester.chatChannelSearchRequest().
                                thirdSearchString().
                                telegramPrivate().
                                noChat().
                                receiveResponse();

                            tester.notificationSection.expectToHaveTextContent(
                                'Закрыть все ' +

                                'Ошибка открытия чата ' +
                                'Канал не найден',
                            );
                        });
                        it('От родительского окна получен запрос каналов. Запрос каналов отправлен на сервер.', function() {
                            tester.channelsSearchingRequest().receive();

                            tester.visitorExternalSearchingRequest().
                                anotherToken().
                                fourthSearchString().
                                telegramPrivate().
                                expectToBeSent();
                        });
                        it(
                            'Нажимаю на кнопку скачивания лога. В родительское окно отправлен запрос скачивания лога.',
                        function() {
                            tester.bugButton.click();

                            tester.logDownloadingRequest().
                                windowMessage().
                                expectToBeSent();
                        });
                        it('Нажимаю на кнопку закрытия. Окно чатов закрыто.', function() {
                            tester.closeButton.click();
                            tester.chatsHidingRequest().expectToBeSent();
                        });
                        it('Используется русский язык.', function() {
                            tester.body.expectTextContentToHaveSubstring('Мои чаты');
                            tester.body.expectTextContentNotToHaveSubstring('My chats');

                            tester.logoutButton.expectNotToExist();
                        });
                    });
                    it(
                        'Не удалось получить список заявок потому, что сотрудник стал неавторизованным.',
                    function() {
                        offlineMessageListRequest.
                            unauthorized().
                            receiveResponse();

                        salesbotChannelsRequest.
                            noChannels().
                            expectResponseToBeSent();

                        tester.unreadMessagesCountSettingRequest().expectToBeSent();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });

                        tester.employeesWebSocket.finishDisconnecting();
                        tester.chatsWebSocket.finishDisconnecting();

                        tester.employeesBroadcastChannel().
                            leaderDeath().
                            expectToBeSent();

                        tester.body.expectToHaveTextContent(
                            'Не авторизован ' +
                            'Для использования приложения необходимо авторизоваться'
                        );
                    });
                });
                describe('Не удалось получить данные аккаунта из-за ошибки авторизации.', function() {
                    beforeEach(function() {
                        accountRequest.
                            unauthorized().
                            receiveResponse();

                        secondAccountRequest.
                            unauthorized().
                            receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });
                    });

                    it('Нажимаю на кнопку выхода. Открыта страница выхода.', function() {
                        tester.logoutButton.click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/ru/logout');
                    });
                    it('Отображено сообщение о том, что сотрудник не авторизован.', function() {
                        tester.body.expectToHaveTextContent(
                            'Не авторизован ' +
                            'Для использования приложения необходимо авторизоваться'
                        );
                    });
                });
                it(
                    'На другой вкладке произведён выход. Отображено сообщение о том, что сотрудник не авторизован.',
                function() {
                    localStorage.setItemInAnotherTab('token', '');

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });

                    accountRequest.
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    secondAccountRequest.
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.body.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования приложения необходимо авторизоваться'
                    );
                });
                it('Нет прав на чаты. Отображено сообщение об отсутствии прав.', function() {
                    accountRequest.receiveResponse();
                    tester.sourcesSettingRequest().expectToBeSent();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent().
                        waitForSecond();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent().
                        waitForSecond();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.employeesWebSocket.connect();
                    tester.employeesWebsocketConnectedMessage().expectToBeSent();

                    tester.employeesInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.employeeSettingsRequest().receiveResponse();

                    tester.employeeRequest().
                        oauthToken().
                        receiveResponse();

                    secondAccountRequest.receiveResponse();

                    const thirdAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    tester.chatsWebSocket.connect();

                    tester.chatsInitMessage().
                        oauthToken().
                        expectToBeSent();

                    thirdAccountRequest.receiveResponse();

                    salesbotChannelsRequest.
                        disallowed().
                        expectResponseToBeSent();

                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.groupChatsRequest().receiveResponse();
                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();

                    tester.countersRequest().
                        noNewChats().
                        noClosedChats().
                        noActiveChats().
                        receiveResponse();

                    tester.tagsRequest().receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        noData().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        active().
                        noData().
                        receiveResponse();

                    tester.chatListRequest().forCurrentEmployee().
                        closed().
                        noData().
                        receiveResponse();

                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();

                    tester.body.expectToHaveTextContent(
                        'UIS k ' +
                        'Недостаточно прав на раздел чатов'
                    );
                });
            });
            it('Получена английская локаль. Используется английский язык.', function() {
                tester.amocrmStateSettingRequest().
                    chats().
                    en().
                    receive();

               tester.tokenInitializationRequest().
                    chats().
                    expectToBeSent();

                postMessages.receive({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                tester.widgetSettings().
                    amocrm().
                    chatsSettings().
                    request().
                    receiveResponse();

                tester.availabilitySettingRequest().
                    chats().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                salesbotChannelsRequest = tester.salesbotChannelsRequest().receive();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                tester.chatSettingsRequest().receiveResponse();
                tester.channelsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.commonEmployeeStatusRequest().receiveResponse();
                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();
                tester.settingsAppRequest().receiveResponse();

                secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                accountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.sourcesSettingRequest().expectToBeSent();

                unfilteredPostMessages.
                    nextMessage().
                    expectMessageToStartsWith('ignore:log:').
                    expectMessageToContain(
                        '[employees] Tab state is unknown'
                    );

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

                secondAccountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.chatsWebSocket.connect();

                tester.chatsInitMessage().
                    oauthToken().
                    expectToBeSent();

                const requests = ajax.inAnyOrder();

                const employeeSettingsRequest = tester.employeeSettingsRequest().
                    expectToBeSent(requests);

                const employeeRequest = tester.employeeRequest().
                    oauthToken().
                    expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                thirdAccountRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    receiveResponse();

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.groupChatsRequest().receiveResponse();
                tester.chatChannelTypeListRequest().receiveResponse();
                tester.offlineMessageListRequest().notProcessed().receiveResponse();
 
                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    receiveResponse();

                tester.unreadMessagesCountSettingRequest().
                    value(75).
                    expectToBeSent();

                tester.tagsRequest().receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    active().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    closed().
                    noData().
                    receiveResponse();

                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                salesbotChannelsRequest.expectResponseToBeSent();

                tester.body.expectTextContentToHaveSubstring('My chats');
                tester.body.expectTextContentNotToHaveSubstring('Мои чаты');
            });
            it(
                'Получено состояние виджета без фичефлага sources_origins. Отправлен список источников без ' +
                'списка origins.',
            function() {
                tester.amocrmStateSettingRequest().
                    noFeatures().
                    chats().
                    receive();

                tester.widgetSettings().
                    amocrm().
                    chatsSettings().
                    request().
                    receiveResponse();

                tester.availabilitySettingRequest().
                    chats().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                salesbotChannelsRequest = tester.salesbotChannelsRequest().receive();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                tester.chatSettingsRequest().receiveResponse();
                tester.channelsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.commonEmployeeStatusRequest().receiveResponse();
                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();
                tester.settingsAppRequest().receiveResponse();

                secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                accountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.sourcesSettingRequest().
                    noOrigins().
                    expectToBeSent();

                unfilteredPostMessages.
                    nextMessage().
                    expectMessageToStartsWith('ignore:log:').
                    expectMessageToContain(
                        '[employees] Tab state is unknown'
                    );

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

                const requests = ajax.inAnyOrder();

                const employeeSettingsRequest = tester.employeeSettingsRequest().
                    expectToBeSent(requests);

                const employeeRequest = tester.employeeRequest().
                    oauthToken().
                    expectToBeSent(requests);
            });
            it('Прошло некоторое время. Отображена страница чатов.', function() {
                spendTime(3000);
                spendTime(0);
                spendTime(0);
                spendTime(0);

                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                tester.widgetSettings().
                    amocrm().
                    chatsSettings().
                    request().
                    receiveResponse();

                tester.availabilitySettingRequest().
                    chats().
                    expectToBeSent();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                tester.chatSettingsRequest().receiveResponse();
                tester.channelsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.commonEmployeeStatusRequest().receiveResponse();
                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();
                tester.settingsAppRequest().receiveResponse();

                secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                accountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.sourcesSettingRequest().
                    noOrigins().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

                const requests = ajax.inAnyOrder();

                const employeeSettingsRequest = tester.employeeSettingsRequest().
                    expectToBeSent(requests);

                const employeeRequest = tester.employeeRequest().
                    oauthToken().
                    expectToBeSent(requests);

                tester.body.expectToHaveTextContent('UIS k');
            });
            it('Ни одно сообщение не было отправлено в родетельское окно.', function() {
                postMessages.nextMessage().expectNotToExist();
                tester.body.expectToHaveTextContent('');
            });
        });
        describe('Открываю IFrame чатов amoCRM. Сотрудник не авторизован.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmChatsIframeContent',
                    isIframe: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.unreadMessagesCountSettingRequest().expectToBeSent();
            });

            describe('Получено состояние виджета amoCRM.', function() {
                beforeEach(function() {
                    tester.amocrmStateSettingRequest().
                        chats().
                        receive();

                    tester.tokenInitializationRequest().
                        chats().
                        emptyToken().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'set_token',
                        data: '',
                    });

                    postMessages.
                        nextMessage().
                        expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });
                });

                xdescribe('В другом окне произошла авторизация.', function() {
                    let widgetSettings;

                    beforeEach(function() {
                        localStorage.setItemInAnotherTab('token', tester.oauthToken);
                        tester.submoduleInitilizationEvent().expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            expectToBeSent();

                        postMessages.
                            nextMessage().
                            expectMessageToContain({
                                method: 'set_token',
                                data: tester.oauthToken,
                            });

                        widgetSettings = tester.widgetSettings().
                            amocrm().
                            chatsSettings().
                            request().
                            expectToBeSent();
                    });

                    describe('Чаты доступны. Производятся запросы данных для чатов.', function() {
                        let listRequest;

                        beforeEach(function() {
                            widgetSettings.receiveResponse();

                            tester.availabilitySettingRequest().
                                chats().
                                expectToBeSent();

                            let requests = ajax.inAnyOrder();

                            const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                            const channelsRequest = tester.channelsRequest().expectToBeSent(requests);
                            const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);

                            const employeeStatusesRequest = tester.employeeStatusesRequest().
                                oauthToken().
                                expectToBeSent(requests);

                            listRequest = tester.listRequest().expectToBeSent(requests);
                            const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                            const messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);
                            const commonEmployeeStatusRequest = tester.commonEmployeeStatusRequest().expectToBeSent(requests);
                            const settingsAppRequest = tester.settingsAppRequest().expectToBeSent(requests);

                            const commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().
                                expectToBeSent(requests);

                            const messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().
                                expectToBeSent(requests);

                            const secondAccountRequest = tester.accountRequest().
                                forIframe().
                                fromIframe().
                                webAccountLoginUnavailable().
                                expectToBeSent(requests);

                            const accountRequest = tester.accountRequest().
                                forIframe().
                                webAccountLoginUnavailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();

                            chatSettingsRequest.receiveResponse();
                            channelsRequest.receiveResponse();
                            chatChannelListRequest.receiveResponse();
                            employeeStatusesRequest.receiveResponse();
                            siteListRequest.receiveResponse();
                            messageTemplateListRequest.receiveResponse();
                            commonMessageTemplatesRequest.receiveResponse();
                            messageTemplatesSettingsRequest.receiveResponse();
                            commonEmployeeStatusRequest.receiveResponse();
                            settingsAppRequest.receiveResponse();

                            accountRequest.
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                expectToBeSent();

                            tester.employeesWebSocket.connect();
                            tester.employeesWebsocketConnectedMessage().expectToBeSent();

                            tester.employeesInitMessage().
                                oauthToken().
                                expectToBeSent();

                            secondAccountRequest.
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.chatsWebSocket.connect();

                            tester.chatsInitMessage().
                                oauthToken().
                                expectToBeSent();

                            const employeeSettingsRequest = tester.employeeSettingsRequest().
                                expectToBeSent();

                            const employeeRequest = tester.employeeRequest().
                                oauthToken().
                                expectToBeSent();

                            const thirdAccountRequest = tester.accountRequest().
                                forIframe().
                                fromIframe().
                                webAccountLoginUnavailable().
                                operatorWorkplaceAvailable().
                                expectToBeSent();

                            const chatListRequest = tester.chatListRequest().
                                forCurrentEmployee().
                                noData().
                                expectToBeSent();

                            const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                emptySearchString().
                                expectToBeSent();

                        });

                        it('Не удалось получить список сотрудников.', function() {
                            listRequest.
                                failed().
                                receiveResponse();

                            tester.sourcesSettingRequest().
                                noGroupsFiltration().
                                expectToBeSent();
                        });
                        it('Получен список сотрудников. Отправлен список источников.', function() {
                            listRequest.receiveResponse();
                            tester.sourcesSettingRequest().expectToBeSent();
                        });
                    });
                    it(
                        'В софтфоне произведён выход из приложения. Получен ответ на запрос настроек чатов. В софтфоне ' +
                        'произведён вход в приложение. Сообщение об отстутствии прав скрыто.',
                    function() {
                        localStorage.setItemInAnotherTab('token', '');

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });

                        widgetSettings.receiveResponse();

                        tester.availabilitySettingRequest().
                            chats().
                            expectToBeSent();

                        localStorage.setItemInAnotherTab('token', tester.oauthToken);

                        postMessages.
                            nextMessage().
                            expectMessageToContain({
                                method: 'set_token',
                                data: tester.oauthToken,
                            });

                        tester.employeeStatusesRequest().
                            oauthToken().
                            expectToBeSent();

                        tester.chatSettingsRequest().expectToBeSent();
                        tester.channelsRequest().expectToBeSent();
                        tester.chatChannelListRequest().expectToBeSent();

                        tester.commonEmployeeStatusRequest().receiveResponse();
                        tester.listRequest().expectToBeSent();
                        tester.siteListRequest().expectToBeSent();
                        tester.messageTemplateListRequest().expectToBeSent();
                        tester.commonMessageTemplatesRequest().expectToBeSent();
                        tester.messageTemplatesSettingsRequest().expectToBeSent();
                        tester.settingsAppRequest().receiveResponse();

                        tester.accountRequest().
                            forIframe().
                            fromIframe().
                            webAccountLoginUnavailable().
                            expectToBeSent();

                        tester.widgetSettings().
                            amocrm().
                            chatsSettings().
                            request().
                            expectToBeSent();

                        tester.body.expectTextContentNotToHaveSubstring(
                            'Недостаточно прав на раздел чатов'
                        );
                    });
                    it('Чаты недоступны. Софтфон доступен. Запросы данных для чатов не производятся.', function() {
                        widgetSettings.
                            unavailable().
                            receiveResponse();

                        tester.availabilitySettingRequest().
                            chats().
                            unavailable().
                            expectToBeSent();
                    });
                });
                xdescribe('Получен запрос каналов whatsApp.', function() {
                    let secondAccountRequest,
                        accountRequest,
                        salesbotChannelsRequest,
                        chatSettingsRequest,
                        channelsRequest,
                        chatChannelListRequest,
                        employeeStatusesRequest,
                        commonEmployeeStatusRequest,
                        settingsAppRequest,
                        listRequest,
                        siteListRequest,
                        messageTemplateListRequest,
                        commonMessageTemplatesRequest,
                        messageTemplatesSettingsRequest,
                        widgetSettings;

                    beforeEach(function() {
                        salesbotChannelsRequest = tester.salesbotChannelsRequest().receive();

                        localStorage.setItemInAnotherTab('token', tester.oauthToken);
                        tester.submoduleInitilizationEvent().expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            expectToBeSent();

                        postMessages.
                            nextMessage().
                            expectMessageToContain({
                                method: 'set_token',
                                data: tester.oauthToken,
                            });

                        widgetSettings = tester.widgetSettings().
                            amocrm().
                            chatsSettings().
                            request().
                            expectToBeSent();
                    });

                    describe('Чаты доступны.', function() {
                        beforeEach(function() {
                            widgetSettings.receiveResponse();

                            tester.availabilitySettingRequest().
                                chats().
                                expectToBeSent();

                            let requests = ajax.inAnyOrder();

                            chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                            channelsRequest = tester.channelsRequest().expectToBeSent(requests);
                            chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);

                            employeeStatusesRequest = tester.employeeStatusesRequest().
                                oauthToken().
                                expectToBeSent(requests);

                            commonEmployeeStatusRequest = tester.commonEmployeeStatusRequest().expectToBeSent(requests);
                            listRequest = tester.listRequest().expectToBeSent(requests);
                            siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                            messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);
                            settingsAppRequest = tester.settingsAppRequest().expectToBeSent(requests);

                            commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().
                                expectToBeSent(requests);

                            messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().
                                expectToBeSent(requests);

                            secondAccountRequest = tester.accountRequest().
                                forIframe().
                                fromIframe().
                                webAccountLoginUnavailable().
                                expectToBeSent(requests);

                            accountRequest = tester.accountRequest().
                                forIframe().
                                webAccountLoginUnavailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();
                        });

                        it('Есть права на чаты. В родительское окно отправлен список каналов для Salesbot.', function() {
                            accountRequest.
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                expectToBeSent();

                            tester.employeesWebSocket.connect();
                            tester.employeesWebsocketConnectedMessage().expectToBeSent();

                            tester.employeesInitMessage().
                                oauthToken().
                                expectToBeSent();

                            secondAccountRequest.
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.chatsWebSocket.connect();

                            tester.chatsInitMessage().
                                oauthToken().
                                expectToBeSent();

                            let thirdAccountRequest,
                                fourthAccountRequest;

                            {
                                let requests = ajax.inAnyOrder();
         
                                const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                                const offlineMessageCountersRequest = tester.offlineMessageCountersRequest().expectToBeSent(requests);
                                const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);

                                thirdAccountRequest = tester.accountRequest().
                                    forIframe().
                                    fromIframe().
                                    webAccountLoginUnavailable().
                                    operatorWorkplaceAvailable().
                                    expectToBeSent(requests);

                                const countersRequest = tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    expectToBeSent(requests);

                                const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                                const employeeRequest = tester.employeeRequest().
                                    oauthToken().
                                    expectToBeSent(requests);

                                fourthAccountRequest = tester.accountRequest().
                                    forIframe().
                                    fromIframe().
                                    webAccountLoginUnavailable().
                                    operatorWorkplaceAvailable().
                                    expectToBeSent(requests);

                                const chatListRequest = tester.chatListRequest().
                                    forCurrentEmployee().
                                    noData().
                                    expectToBeSent(requests);

                                const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                    emptySearchString().
                                    expectToBeSent(requests);

                                requests.expectToBeSent();

                                chatChannelListRequest.receiveResponse();
                                offlineMessageCountersRequest.receiveResponse();
                                siteListRequest.receiveResponse();
                                chatSettingsRequest.receiveResponse();
                                countersRequest.receiveResponse();
                                employeeSettingsRequest.receiveResponse();
                                employeeRequest.receiveResponse();
                                chatListRequest.receiveResponse();
                                chatChannelSearchRequest.receiveResponse();
                            }
     
                            tester.unreadMessagesCountSettingRequest().
                                value(75).
                                expectToBeSent();

                            thirdAccountRequest.receiveResponse();
                            fourthAccountRequest.receiveResponse();

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.groupChatsRequest().receiveResponse();
                            tester.chatChannelTypeListRequest().receiveResponse();
                            tester.offlineMessageListRequest().notProcessed().receiveResponse();

                            tester.countersRequest().
                                noNewChats().
                                noClosedChats().
                                receiveResponse();

                            tester.tagsRequest().receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                noData().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                active().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                closed().
                                noData().
                                receiveResponse();

                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();

                            chatSettingsRequest.receiveResponse();
                            channelsRequest.receiveResponse();
                            chatChannelListRequest.receiveResponse();
                            employeeStatusesRequest.receiveResponse();
                            listRequest.receiveResponse();
                            siteListRequest.receiveResponse();
                            messageTemplateListRequest.receiveResponse();
                            commonMessageTemplatesRequest.receiveResponse();
                            messageTemplatesSettingsRequest.receiveResponse();
                            commonEmployeeStatusRequest.receiveResponse();
                            settingsAppRequest.receiveResponse();

                            tester.sourcesSettingRequest().expectToBeSent();
                            salesbotChannelsRequest.expectResponseToBeSent();
                        });
                        it('Нет прав на чаты.', function() {
                            accountRequest.
                                softphoneFeatureFlagDisabled().
                                receiveResponse();

                            salesbotChannelsRequest.
                                disallowed().
                                expectResponseToBeSent();

                            secondAccountRequest.
                                softphoneFeatureFlagDisabled().
                                receiveResponse();

                            tester.accountRequest().
                                forIframe().
                                fromIframe().
                                webAccountLoginUnavailable().
                                softphoneFeatureFlagDisabled().
                                receiveResponse();

                            tester.chatsWebSocket.connect();

                            tester.chatsInitMessage().
                                oauthToken().
                                expectToBeSent();

                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.groupChatsRequest().receiveResponse();
                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();

                            tester.countersRequest().
                                noNewChats().
                                noClosedChats().
                                noActiveChats().
                                receiveResponse();

                            tester.tagsRequest().receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                noData().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                active().
                                noData().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                closed().
                                noData().
                                receiveResponse();

                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();

                            listRequest.receiveResponse();
                            tester.sourcesSettingRequest().expectToBeSent();
                        });
                        it('Не удалось получить данные аккаунта. Чаты скрыты.', function() {
                            accountRequest.
                                failed().
                                receiveResponse();

                            salesbotChannelsRequest.
                                serverError().
                                expectResponseToBeSent();
                        });
                    });
                    it('Чаты недоступны.', function() {
                        widgetSettings.
                            unavailable().
                            receiveResponse();

                        tester.availabilitySettingRequest().
                            chats().
                            unavailable().
                            expectToBeSent();

                        salesbotChannelsRequest.
                            unavailable().
                            expectResponseToBeSent();
                    });
                });
                xit('Получен дубайский токен. Авторизация не производится.', function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: tester.anotherOauthToken,
                    });

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: tester.anotherOauthToken,
                    });
                });
                it('Отображено сообщение о том, что сотрудник не авторизован.', function() {
                    tester.iframe.expectAttributeToHaveValue(
                        'src',
                        'https://uc-sso-amocrm-prod-api.uiscom.ru',
                    );

                    return;
                    tester.body.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования приложения необходимо авторизоваться'
                    );
                });
            });
            return;
            it('Софтфон недоступен. Производется запрос данных для чатов.', function() {
                tester.amocrmStateSettingRequest().
                    chats().
                    softphoneDisabled().
                    receive();

                tester.tokenInitializationRequest().
                    chats().
                    emptyToken().
                    expectToBeSent();

                postMessages.receive({
                    method: 'set_token',
                    data: '',
                });

                postMessages.
                    nextMessage().
                    expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });

                localStorage.setItemInAnotherTab('token', tester.oauthToken);
                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                postMessages.
                    nextMessage().
                    expectMessageToContain({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });

                widgetSettings = tester.widgetSettings().
                    amocrm().
                    chatsSettings().
                    request().
                    expectToBeSent();

                widgetSettings.
                    unavailable().
                    receiveResponse();

                tester.availabilitySettingRequest().
                    chats().
                    expectToBeSent();

                let requests = ajax.inAnyOrder();

                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                const channelsRequest = tester.channelsRequest().expectToBeSent(requests);
                const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);

                const employeeStatusesRequest = tester.employeeStatusesRequest().
                    oauthToken().
                    expectToBeSent(requests);

                const commonEmployeeStatusRequest = tester.commonEmployeeStatusRequest().
                    expectToBeSent(requests);

                const listRequest = tester.listRequest().expectToBeSent(requests);
                const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                const messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);
                const settingsAppRequest = tester.settingsAppRequest().expectToBeSent(requests);

                const commonMessageTemplatesRequest = tester.commonMessageTemplatesRequest().
                    expectToBeSent(requests);

                const messageTemplatesSettingsRequest = tester.messageTemplatesSettingsRequest().
                    expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent(requests);

                const accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                chatSettingsRequest.receiveResponse();
                channelsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                commonMessageTemplatesRequest.receiveResponse();
                messageTemplatesSettingsRequest.receiveResponse();
                commonEmployeeStatusRequest.receiveResponse();
                settingsAppRequest.receiveResponse();

                accountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

                secondAccountRequest.
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.chatsWebSocket.connect();

                tester.chatsInitMessage().
                    oauthToken().
                    expectToBeSent();

                const employeeSettingsRequest = tester.employeeSettingsRequest().
                    expectToBeSent();

                const employeeRequest = tester.employeeRequest().
                    oauthToken().
                    expectToBeSent();

                const thirdAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    operatorWorkplaceAvailable().
                    expectToBeSent();

                const chatListRequest = tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    expectToBeSent();

                const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                    emptySearchString().
                    expectToBeSent();

                tester.sourcesSettingRequest().expectToBeSent();
            });
            it('Ссылка на авторизацию не отображена.', function() {
                tester.body.expectToHaveTextContent('');
            });
        });
        return;
        it(
            'Открываю IFrame чатов amoCRM. Сохранённый токен не соответсвтует датацентру содержимого IFrame. ' +
            'Компонент чатов отустутвует',
        function() {
            tester = new Tester({
                application: 'amocrmChatsIframeContent',
                isIframe: true,
                isAuthorized: true,
                anotherToken: true,
                softphoneHost: 'my.uiscom.ru',
                ...options,
            });

            tester.unreadMessagesCountSettingRequest().expectToBeSent();

            tester.amocrmStateSettingRequest().
                chats().
                receive();

            tester.tokenInitializationRequest().
                chats().
                emptyToken().
                expectToBeSent();

            tester.localStorage.
                key('token').
                expectToBeEmpty();
        });
    });
});
