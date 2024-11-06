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

        describe('Открываю IFrame чатов. Получены настройки.', function() {
            let accountRequest,
                secondAccountRequest,
                widgetSettings;

            beforeEach(function() {
                tester = new Tester({
                    application: 'chatsIframe',
                    isIframe: true,
                    ...options,
                });

                tester.unreadMessagesCountSettingRequest().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().expectToBeSent();

                widgetSettings = tester.widgetSettings().
                    windowMessage().
                    chatsSettings();
            });

            describe('Получен российский токен.', function() {
                beforeEach(function() {
                    widgetSettings.receive();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();
                });

                describe('Чаты доступны.', function() {
                    let chatListRequest;

                    beforeEach(function() {
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

                        tester.employeeSettingsRequest().receiveResponse();

                        tester.employeeRequest().
                            oauthToken().
                            receiveResponse();

                        tester.accountRequest().
                            forIframe().
                            fromIframe().
                            webAccountLoginUnavailable().
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.chatChannelSearchRequest().
                            emptySearchString().
                            receiveResponse();

                        tester.countersRequest().
                            noNewChats().
                            noClosedChats().
                            receiveResponse();

                        tester.unreadMessagesCountSettingRequest().
                            value(75).
                            expectToBeSent();

                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            noData().
                            receiveResponse();

                        chatListRequest = tester.chatListRequest().
                            forCurrentEmployee().
                            active().
                            expectToBeSent();

                        tester.chatListRequest().forCurrentEmployee().
                            closed().
                            noData().
                            receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();

                        tester.button('В работе 75').click();
                    });

                    describe('Контакт не найден.', function() {
                        beforeEach(function() {
                            chatListRequest.receiveResponse();
                        });

                        describe('Получен запрос поиска каналов.', function() {
                            let visitorExternalSearchingRequest,
                                chatChannelSearchRequest;

                            beforeEach(function() {
                                tester.channelsSearchingRequest().receive();

                                visitorExternalSearchingRequest = tester.visitorExternalSearchingRequest().
                                    anotherToken().
                                    fourthSearchString().
                                    telegramPrivate().
                                    expectToBeSent();

                                chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                    thirdSearchString().
                                    telegramPrivate().
                                    addTelegramPrivate();
                            });

                            describe('В канале есть чужие чаты.', function() {
                                beforeEach(function() {
                                    chatChannelSearchRequest.anotherEmployee();
                                });

                                describe('Поиск каналов завершен. Ответ отправлен в родительское окно.', function() {
                                    beforeEach(function() {
                                        visitorExternalSearchingRequest.receiveResponse();
                                        chatChannelSearchRequest.receiveResponse();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();
                                    });

                                    describe(
                                        'Получен запрос открытия чата с номером по которому не производился поиск.', 
                                    function() {
                                        beforeEach(function() {
                                            tester.chatOpeningRequest().
                                                anotherPhone().
                                                anotherChannel().
                                                receive();

                                            tester.visitorExternalSearchingRequest().
                                                anotherToken().
                                                fifthSearchString().
                                                telegramPrivate().
                                                receiveResponse();

                                            tester.chatChannelSearchRequest().
                                                fourthSearchString().
                                                telegramPrivate().
                                                anotherChannel().
                                                noChat().
                                                receiveResponse();

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
                                                thirdPhone().
                                                anotherChannel().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                thirdChat().
                                                receiveResponse();

                                            tester.submoduleInitilizationEvent().
                                                contacts().
                                                expectToBeSent();

                                            tester.scheduledMessagesRequest().receiveResponse();
                                            tester.visitorCardRequest().receiveResponse();
                                            tester.chatInfoRequest().receiveResponse();

                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();

                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();
                                        });

                                        describe('Принимаю чат в работу.', function() {
                                            beforeEach(function() {
                                                tester.button('Принять чат в работу').click();
                                                tester.acceptChatRequest().receiveResponse();
                                            });

                                            it(
                                                'Перевожу чат другому оператору. Чат закрывается, список чатов ' +
                                                'отображён.',
                                            function() {
                                                tester.moreIcon.click();

                                                tester.select.
                                                    option('Переадресовать чат').
                                                    click();

                                                tester.select.click();

                                                tester.chatTransferGroupsRequest().receiveResponse();

                                                tester.select.
                                                    option('Костова Марвуда Любенова').
                                                    click();

                                                tester.button('Отправить').click();
                                                tester.requestTransfer().receiveResponse();

                                                tester.countersRequest().
                                                    noNewChats().
                                                    noClosedChats().
                                                    receiveResponse();

                                                tester.button('Закрыть').click();
                                                tester.transferAcceptedMessage().receive();

                                                spendTime(5000);

                                                tester.employeesPing().expectToBeSent();
                                                tester.employeesPing().receive();

                                                tester.countersRequest().
                                                    noNewChats().
                                                    noClosedChats().
                                                    receiveResponse();

                                                tester.button('В работе 75').expectToBeVisible();
                                            });
                                            it('Нажимаю на кнопку шаблонов. Отображён список шаблонов.', function() {
                                                tester.templateIcon.click();
                                                tester.chatTemplateMenu.expectToBeVisible();
                                            });
                                        });
                                        it('Чат открыт.', function() {
                                            tester.button('В работе 75').expectNotToExist();

                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Помакова Бисерка Драгановна'
                                            );
                                        });
                                    });
                                    it(

                                        'Получен такой же запрос поиска каналов. Ответ отправлен в родительское окно.',
                                    function() {
                                        tester.channelsSearchingRequest().receive();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();
                                    });
                                    it('Ничего не произошло.', function() {
                                        postMessages.nextMessage().expectNotToExist();
                                        ajax.expectNoRequestsToBeSent();
                                    });
                                });
                                describe('Получен другой запрос поиска каналов.', function() {
                                    beforeEach(function() {
                                        tester.channelsSearchingRequest().
                                            anotherPhone().
                                            receive();
                                    });

                                    it(
                                        'Поиск каналов завершен. Отправлен запрос в сервер. Ответы отправлены в ' +
                                        'родительское окно.',
                                    function() {
                                        visitorExternalSearchingRequest.receiveResponse();
                                        chatChannelSearchRequest.receiveResponse();
                                       
                                        tester.visitorExternalSearchingRequest().
                                            anotherToken().
                                            fifthSearchString().
                                            telegramPrivate().
                                            receiveResponse();

                                        tester.chatChannelSearchRequest().
                                            fourthSearchString().
                                            telegramPrivate().
                                            anotherChannel().
                                            noChat().
                                            receiveResponse();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();

                                        tester.channelsSearchingResponse().
                                            anotherChannel().
                                            expectToBeSent();
                                    });
                                    it(
                                        'Поиск каналов завершен. Один из запросов завершился неудачей. Отправлен ' +
                                        'запрос в сервер. Ответы отправлены в родительское окно.',
                                    function() {
                                        visitorExternalSearchingRequest.receiveResponse();

                                        chatChannelSearchRequest.
                                            invalidFormat().
                                            receiveResponse();
                                       
                                        tester.visitorExternalSearchingRequest().
                                            anotherToken().
                                            fifthSearchString().
                                            telegramPrivate().
                                            receiveResponse();

                                        tester.chatChannelSearchRequest().
                                            fourthSearchString().
                                            telegramPrivate().
                                            anotherChannel().
                                            noChat().
                                            receiveResponse();

                                        tester.channelsSearchingResponse().
                                            nothingFound().
                                            expectToBeSent();

                                        tester.channelsSearchingResponse().
                                            anotherChannel().
                                            expectToBeSent();
                                    });
                                    it('Запрос в сервер не был отправлен.', function() {
                                        ajax.expectNoRequestsToBeSent();
                                    });
                                });
                                it(
                                    'Получен такой же запрос поиска каналов. Ответ отправелен в родительское окно ' +
                                    'только один раз.',
                                function() {
                                    tester.channelsSearchingRequest().receive();

                                    visitorExternalSearchingRequest.receiveResponse();
                                    chatChannelSearchRequest.receiveResponse();

                                    tester.channelsSearchingResponse().
                                        addChannel().
                                        unavailable().
                                        expectToBeSent();
                                });
                            });
                            describe(
                                'В канале нет чатов. Получен запрос открытия чата с номером по которому производился ' +
                                'поиск.',
                            function() {
                                let newChatListRequest,
                                    activeChatListRequest,
                                    closedChatListRequest,
                                    otherChatListRequest;

                                beforeEach(function() {
                                    visitorExternalSearchingRequest.receiveResponse();
                                    chatChannelSearchRequest.noChat().receiveResponse();

                                    tester.channelsSearchingResponse().
                                        addChannel().
                                        expectToBeSent();

                                    tester.chatOpeningRequest().receive();

                                    newChatListRequest = tester.chatListRequest().
                                        forCurrentEmployee().
                                        noData().
                                        expectToBeSent();

                                    activeChatListRequest = tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        secondPage().
                                        expectToBeSent();

                                    closedChatListRequest = tester.chatListRequest().
                                        closed().
                                        noData().
                                        forCurrentEmployee().
                                        expectToBeSent();

                                    otherChatListRequest = tester.chatListRequest().
                                        active().
                                        noData().
                                        forCurrentEmployee().
                                        isOtherEmployeesAppeals().
                                        expectToBeSent();
                                });

                                describe('Получен список чатов.', function() {
                                    beforeEach(function() {
                                        newChatListRequest.receiveResponse();
                                        activeChatListRequest.receiveResponse();
                                        closedChatListRequest.receiveResponse();
                                        otherChatListRequest.receiveResponse();

                                        tester.chatStartingRequest().
                                            anotherPhone().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            thirdChat().
                                            receiveResponse();
            
                                        tester.submoduleInitilizationEvent().
                                            contacts().
                                            expectToBeSent();

                                        tester.scheduledMessagesRequest().receiveResponse();
                                        tester.visitorCardRequest().receiveResponse();
                                        tester.chatInfoRequest().receiveResponse();

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();
                                    });

                                    it('Получен запрос отображения списка чатов. Список чатов отображён.', function() {
                                        tester.chatListOpeningRequest().receive();

                                        tester.chatList.
                                            first.
                                            item('Помакова Бисерка').
                                            expectToBeVisible();
                                    });
                                    it('Чат начат.', function() {
                                        tester.chatList.first.expectNotToExist();
                                        tester.spin.expectNotToExist();

                                        tester.contactBar.expectTextContentToHaveSubstring(
                                            'ФИО ' +
                                            'Помакова Бисерка Драгановна'
                                        );
                                    });
                                });
                                it('Плейсхолдер не отображается.', function() {
                                    tester.spin.expectToBeVisible();
                                    tester.body.expectToHaveTextContent('');
                                });
                            });
                        });
                        describe('Приходит новое сообщение.', function() {
                            let notificationShowingRequest;

                            beforeEach(function() {
                                tester.newMessage().receive();

                                tester.chatListRequest().
                                    chat().
                                    receiveResponse();

                                tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();

                                notificationShowingRequest = tester.notificationShowingRequest().expectToBeSent();
                            });

                            it('Нажимаю на уведомление. Открыт чат.', function() {
                                notificationShowingRequest.
                                    click().
                                    receive();

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Помакова Бисерка Драгановна'
                                );
                            });
                            it('Ничего не происходит.', function() {
                                postMessages.nextMessage().expectNotToExist();
                            });
                        });
                        describe('Выбираю чат.', function() {
                            beforeEach(function() {
                                tester.chatList.
                                    first.
                                    item('Привет').
                                    click();

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    read().
                                    anotherMessage().
                                    receiveResponse();

                                tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();
                            });

                            it('Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.', function() {
                                tester.chatHistory.
                                    header.
                                    closeButton.
                                    click();

                                tester.chatsHidingRequest().expectToBeSent();;
                            });
                            it('Чат открыт.', function() {
                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Помакова Бисерка Драгановна'
                                );
                            });
                        });
                        it(
                            'Приложение открыто в другом браузере. Отображено сообщение о том, что приложение ' +
                            'открыто в другом браузере.',
                        function() {
                            tester.chatsWebSocket.disconnect(4429);

                            tester.body.expectToHaveTextContent('Приложение открыто в другом браузере');
                            tester.closeButton.expectToBeVisible();
                        });
                        it('Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.', function() {
                            tester.closeButton.click();
                            tester.chatsHidingRequest().expectToBeSent();
                        });
                        it('Ввожу значение в поле поиска. Произведён поиск.', function() {
                            tester.searchIcon.click();

                            tester.input.
                                fill('79283810988').
                                pressEnter();

                            tester.searchResultsRequest().
                                anotherToken().
                                anotherSearchString().
                                receiveResponse();

                            tester.chatListItem('Сообщение #75').expectToBeVisible();
                        });
                        it('Ввожу номер для поиска в адресную строку. Произведён поиск.', function() {
                            tester.history.push('/chrome/chats/messages?search=79283810988');

                            tester.searchResultsRequest().
                                anotherToken().
                                anotherSearchString().
                                receiveResponse();

                            tester.chatListItem('Сообщение #75').expectToBeVisible();
                        });
                        it('Получен запрос иконки. В родительское окно отправлена разметка иконки.', function() {
                            tester.iconRequest().expectResponseToBeSent();
                        });
                        it('Отображен список чатов.', function() {
                            tester.chatList.
                                first.
                                item('Привет').
                                expectToBeVisible();

                            tester.spin.expectNotToExist();
                            tester.body.expectTextContentNotToHaveSubstring('Недостаточно прав на раздел чатов');

                            tester.body.expectTextContentToHaveSubstring(
                                'Выберите чат слева для отображения переписки'
                            );

                            unfilteredPostMessages.
                                nextMessage().
                                expectMessageToStartsWith('ignore:log:').
                                expectMessageToContain('Time consumed');
                        });
                    });
                    it('Найден контакт.', function() {
                        chatListRequest.
                            contactExists().
                            receiveResponse();

                        tester.chatList.
                            first.
                            item('Привет').
                            click();

                        tester.submoduleInitilizationEvent().
                            contacts().
                            expectToBeSent();

                        tester.scheduledMessagesRequest().
                            anotherChat().
                            receiveResponse();

                        tester.visitorCardRequest().receiveResponse();
                        tester.messageListRequest().receiveResponse();

                        tester.chatInfoRequest().
                            anotherChat().
                            receiveResponse();

                        tester.usersRequest().
                            forContacts().
                            forIframe().
                            receiveResponse();

                        tester.contactRequest().receiveResponse();

                        tester.changeMessageStatusRequest().
                            read().
                            anotherMessage().
                            receiveResponse();

                        tester.countersRequest().
                            noNewChats().
                            noClosedChats().
                            receiveResponse();

                        tester.groupsContainingContactRequest().
                            forIframe().
                            receiveResponse();

                        tester.contactGroupsRequest().
                            forIframe().
                            receiveResponse();

                        tester.anchor('Бележкова Грета Ервиновна').expectNotToExist();
                        tester.anchor('79162729533').expectNotToExist();
                    });
                });
                it('Не удалось получить данные аккаунта. Чаты скрыты.', function() {
                    accountRequest.
                        failed().
                        receiveResponse();

                    unfilteredPostMessages.
                        nextMessage().
                        expectMessageToStartsWith('ignore:log:').
                        expectMessageToContain('Window message received');

                    tester.body.expectToHaveTextContent('Недостаточно прав на раздел чатов');
                    tester.closeButton.expectToBeVisible();
                });
                it('Чаты недоступны. Чаты скрыты.', function() {
                    accountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    secondAccountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    tester.chatsWebSocket.connect();

                    tester.chatsInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.employeeSettingsRequest().receiveResponse();
                    postMessages.nextMessage().expectNotToExist();

                    tester.employeeRequest().
                        oauthToken().
                        receiveResponse();

                    unfilteredPostMessages.
                        nextMessage().
                        expectMessageToStartsWith('ignore:log:').
                        expectMessageToContain('GET $REACT_APP_BASE_URL/api/v1/employees/20816');

                    tester.body.expectToHaveTextContent('Недостаточно прав на раздел чатов');
                });
            });
            describe('Получен запрос поиска каналов.', function() {
                beforeEach(function() {
                    tester.channelsSearchingRequest().receive();
                });

                it('Получен российский токен. Совершён поиск каналов. Отправлен результат поиска.', function() {
                    widgetSettings.receive();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        expectToBeSent();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();

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

                    tester.visitorExternalSearchingRequest().
                        anotherToken().
                        fourthSearchString().
                        telegramPrivate().
                        receiveResponse();

                    tester.employeeSettingsRequest().receiveResponse();

                    tester.employeeRequest().
                        oauthToken().
                        receiveResponse();

                    tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        addWaba().
                        addThirdTelegramPrivate().
                        receiveResponse();

                    tester.chatChannelSearchRequest().
                        thirdSearchString().
                        telegramPrivate().
                        addTelegramPrivate().
                        noChat().
                        receiveResponse();

                    tester.channelsSearchingResponse().
                        addChannel().
                        expectToBeSent();

                    tester.countersRequest().
                        noNewChats().
                        noClosedChats().
                        receiveResponse();

                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        expectToBeSent();

                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.markListRequest().receiveResponse();

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

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();
                });
                it('Ничего не происходит.', function() {
                    postMessages.nextMessage().expectNotToExist();
                    ajax.expectNoRequestsToBeSent();
                });
            });
            it('Получен дубайский токен. Запрос аккаунта отправлен на дубайский сервер.', function() {
                widgetSettings.
                    anotherToken().
                    receive();

                tester.accountRequest().
                    forIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();

                tester.chatSettingsRequest().expectToBeSent();
                tester.chatChannelListRequest().expectToBeSent();

                tester.employeeStatusesRequest().
                    anotherOauthToken().
                    expectToBeSent();

                tester.listRequest().expectToBeSent();
                tester.siteListRequest().expectToBeSent();
                tester.messageTemplateListRequest().expectToBeSent();
                tester.commonMessageTemplatesRequest().expectToBeSent();
                tester.messageTemplatesSettingsRequest().expectToBeSent();
            });
        });
        describe('Открываю IFrame чатов amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmChatsIframeContent',
                    isIframe: true,
                    isAuthorized: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                const accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                const secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                tester.chatSettingsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();

                tester.unreadMessagesCountSettingRequest().expectToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().expectToBeSent();

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

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

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

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.unreadMessagesCountSettingRequest().
                    value(75).
                    expectToBeSent();
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
                'Нажимаю на кнопку скачивания лога. В родительское окно ' +
                'отправлен запрос скачивания лога.',
            function() {
                tester.bugButton.click();

                tester.logDownloadingRequest().
                    windowMessage().
                    expectToBeSent();
            });
            it('Получена английская локаль. Используется английский язык.', function() {
                tester.amocrmStateSettingRequest().
                    en().
                    receive();

                tester.body.expectTextContentToHaveSubstring('Chats');
                tester.body.expectTextContentNotToHaveSubstring('Чаты');
            });
            it('Нажимаю на кнопку закрытия. Окно чатов закрыто.', function() {
                tester.closeButton.click();
                tester.chatsHidingRequest().expectToBeSent();
            });
            it('Используется русский язык.', function() {
                tester.body.expectTextContentToHaveSubstring('Чаты');
                tester.body.expectTextContentNotToHaveSubstring('Chats');
            });
        });
        describe('Открываю IFrame чатов в Битрикс.', function() {
            let accountRequest,
                secondAccountRequest,
                widgetSettings,
                chatListRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'bitrixChatsIframe',
                    isIframe: true,
                    search: '79283810988',
                    ...options,
                });
            });

            describe('Получаю российский токен.', function() {
                let searchResultsRequest;

                beforeEach(function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();

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

                    accountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    searchResultsRequest = tester.searchResultsRequest().
                        anotherToken().
                        anotherSearchString().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    accountRequest.receiveResponse();
                    employeeSettingsRequest.receiveResponse();
                    employeeRequest.receiveResponse();

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        receiveResponse();

                    tester.countersRequest().
                        noNewChats().
                        noClosedChats().
                        receiveResponse();

                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.markListRequest().receiveResponse();

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

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();
                });

                describe('Получен ответ на запрос чатов.', function() {
                    beforeEach(function() {
                        searchResultsRequest.receiveResponse();
                    });

                    it('Нажимаю на кнопку скачивания лога. Лог скачан.', function() {
                        tester.bugButton.click();

                        tester.anchor.
                            withFileName('20191219.121006.000.log.txt').
                            expectHrefToBeBlobWithSubstring(
                                'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                'Response status: 200 OK; ' +
                                'Time consumed 0 ms' + "\n\n" +

                                'POST https://dev-int0-chats-logic.uis.st/v1/operator?method=get_account'
                            );
                    });
                    it('Отображён список чатов.', function() {
                        tester.chatListItem('Сообщение #75').expectToBeVisible();
                        tester.chatListItem('Сообщение #76').expectNotToExist();

                        tester.input.expectToHaveValue('79283810988');
                    });
                });
                it('Сотрудник не авторизован.', function() {
                    searchResultsRequest.
                        unauthorized().
                        receiveResponse();

                    tester.chatsWebSocket.finishDisconnecting();
                    tester.employeesWebSocket.finishDisconnecting();
                });
            });
            it('Получаю дубайский токен.', function() {
                postMessages.receive({
                    method: 'set_token',
                    data: tester.anotherOauthToken,
                });

                windowOpener.expectToHavePath(
                    'https://prod-msk-softphone-widget-iframe.callgear.ae' +
                    '/bitrix/chats/messages'
                ).expectQueryToContain({
                    search: '79283810988',
                });
            });
            it('Нажимаю на кнопку выхода. Открыта страница выхода.', function() {
                tester.logoutButton.click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix/logout');
            });
            it('Нажимаю на кнопку скачивания лога. Лог скачан.', function() {
                tester.bugButton.click();

                tester.anchor.
                    withFileName('20191219.121006.000.log.txt').
                    expectHrefToBeBlobWithSubstring(
                        'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                        'Authorization token is undefined'
                    );
            });
            it('Нажимаю на ссылку на страницу авторизации. Открыта страница авторизации.', function() {
                tester.span('Для использования приложения необходимо авторизоваться').click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix');
            });
            it('Отображено сообщение о том, что сотрудник не авторизован.', function() {
                tester.body.expectToHaveTextContent(
                    'Не авторизован ' +
                    'Для использования приложения необходимо авторизоваться'
                );
            });
        });
    });
});
