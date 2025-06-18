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

                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                tester.unreadMessagesCountSettingRequest().expectToBeSent();

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

                    tester.employeeStatusesRequest().
                        oauthToken().
                        many().
                        receiveResponse();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.channelsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();
                });

                describe('Чаты доступны.', function() {
                    let chatListRequest,
                        employeesBroadcastChannel;

                    beforeEach(function() {
                        accountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        employeesBroadcastChannel = tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent();
                    });

                    describe('Вкладка является ведущей.', function() {
                        let employeesWebSocket;

                        beforeEach(function() {
                            employeesBroadcastChannel.waitForSecond();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent().
                                waitForSecond();

                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                expectToBeSent();

                            employeesWebSocket = tester.employeesWebSocket.expectToBeConnecting();
                        });

                        describe('Установлено соедниение с вебсокетом.', function() {
                            beforeEach(function() {
                                employeesWebSocket.connect();
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

                                tester.tagsRequest().receiveResponse();

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

                                tester.offlineMessageListRequest().processing().receiveResponse();
                                tester.offlineMessageListRequest().processed().receiveResponse();

                                tester.unreadMessagesCountSettingRequest().
                                    value(75).
                                    expectToBeSent();

                                tester.button('В работе 75').click();
                            });

                            describe('Контакт не найден.', function() {
                                beforeEach(function() {
                                    chatListRequest.receiveResponse();
                                });

                                xdescribe('Получен запрос поиска каналов.', function() {
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

                                        describe(
                                            'Поиск каналов завершен. Ответ отправлен в родительское окно.',
                                        function() {
                                            beforeEach(function() {
                                                visitorExternalSearchingRequest.receiveResponse();
                                                chatChannelSearchRequest.receiveResponse();

                                                tester.channelsSearchingResponse().
                                                    addChannel().
                                                    unavailable().
                                                    expectToBeSent();
                                            });

                                            describe(
                                                'Получен запрос открытия чата с номером по которому не производился ' +
                                                'поиск.', 
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
                                                        thirdPhone().
                                                        anotherChannel().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        thirdChat().
                                                        assignedToCurrentEmployee().
                                                        receiveResponse();

                                                    tester.submoduleInitilizationEvent().
                                                        contacts().
                                                        expectToBeSent();

                                                    tester.scheduledMessagesRequest().receiveResponse();

                                                    tester.visitorCardRequest().receiveResponse();

                                                    tester.usersRequest().
                                                        forContacts().
                                                        forIframe().
                                                        receiveResponse();

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

                                                    describe('Открываю меню действий.', function() {
                                                        beforeEach(function() {
                                                            tester.moreIcon.click();
                                                        });

                                                        describe(
                                                            'Из родительского окна получен запрос каналов. Нажимаю ' +
                                                            'на кнопку завершения чата. Из родительского окна ' +
                                                            'получен повторный запрос каналов.',
                                                        function() {
                                                            let visitorExternalSearchingRequest;

                                                            beforeEach(function() {
                                                                tester.channelsSearchingRequest().
                                                                    fifthPhone().
                                                                    receive();

                                                                visitorExternalSearchingRequest =
                                                                    tester.visitorExternalSearchingRequest().
                                                                        anotherToken().
                                                                        thirdSearchString().
                                                                        telegramPrivate().
                                                                        expectToBeSent();

                                                                tester.select.
                                                                    option('Завершить чат').
                                                                    click();

                                                                tester.chatClosingRequest().receiveResponse();

                                                                tester.chatClosedMessage().
                                                                    anotherChat().
                                                                    receive();

                                                                tester.channelsCacheClearingEvent().expectToBeSent();

                                                                tester.channelsSearchingRequest().
                                                                    second().
                                                                    fifthPhone().
                                                                    receive();

                                                                tester.chatListRequest().
                                                                    forCurrentEmployee().
                                                                    noData().
                                                                    receiveResponse();

                                                                tester.chatListRequest().
                                                                    thirdChat().
                                                                    receiveResponse();

                                                                tester.countersRequest().
                                                                    noNewChats().
                                                                    noClosedChats().
                                                                    receiveResponse();
                                                            });

                                                            it(
                                                                'Получен ответ на запрос каналов. На сервер ' +
                                                                'отправлен повторный запрос каналов.',
                                                            function() {
                                                                visitorExternalSearchingRequest.receiveResponse();

                                                                tester.chatChannelSearchRequest().
                                                                    anotherSearchString().
                                                                    telegramPrivate().
                                                                    receiveResponse();

                                                                tester.channelsSearchingResponse().
                                                                    fifthChannel().
                                                                    expectToBeSent();

                                                                tester.visitorExternalSearchingRequest().
                                                                    anotherToken().
                                                                    fourthSearchString().
                                                                    telegramPrivate().
                                                                    expectToBeSent();
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку закрытия окна чатов. Окно закрыто.',
                                                            function() {
                                                                tester.closeButton.click();
                                                                tester.chatsHidingRequest().expectToBeSent();
                                                            });
                                                            it('Ничего не произошло.', function() {
                                                                postMessages.nextMessage().expectNotToExist();
                                                                ajax.expectNoRequestsToBeSent();
                                                            });
                                                        });
                                                        describe('Открываю список сотрудников для переадресации.', function() {
                                                            beforeEach(function() {
                                                                tester.select.
                                                                    option('Переадресовать чат').
                                                                    click();

                                                                tester.select.click();
                                                                tester.chatTransferGroupsRequest().receiveResponse();
                                                            });

                                                            it(
                                                                'Перевожу чат другому оператору. Чат закрывается, ' +
                                                                'список чатов отображён.',
                                                            function() {
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
                                                                tester.channelsCacheClearingEvent().expectToBeSent();

                                                                spendTime(5000);

                                                                tester.employeesPing().expectToBeSent();
                                                                tester.employeesPing().receive();

                                                                tester.countersRequest().
                                                                    noNewChats().
                                                                    noClosedChats().
                                                                    receiveResponse();

                                                                tester.button('В работе 75').expectToBeVisible();
                                                            });
                                                            it('Отображены иконки статусов.', function() {
                                                                tester.select.
                                                                    option('Чакърова Райна Илковна').
                                                                    icon.
                                                                    expectToBe('OperatorStatusOnline20');

                                                                tester.select.
                                                                    option('Костова Марвуда Любенова').
                                                                    icon.
                                                                    expectToBe('CustomHandsetBlack20').
                                                                    expectToHaveStyle('color', '#6c9297');
                                                            });
                                                        });
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку шаблонов. Отображён список шаблонов.',
                                                    function() {
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

                                                'Получен такой же запрос поиска каналов. Ответ отправлен в ' +
                                                'родительское окно.',
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
                                                'Поиск каналов завершен. Отправлен запрос в сервер. Ответы ' +
                                                'отправлены в родительское окно.',
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
                                                    anotherChannel().
                                                    expectToBeSent();

                                                tester.channelsSearchingResponse().
                                                    addChannel().
                                                    unavailable().
                                                    expectToBeSent();
                                            });
                                            it(
                                                'Поиск каналов завершен. Один из запросов завершился неудачей. ' +
                                                'Отправлен запрос в сервер. Ответы отправлены в родительское окно.',
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
                                                    anotherChannel().
                                                    expectToBeSent();

                                                tester.channelsSearchingResponse().
                                                    nothingFound().
                                                    expectToBeSent();
                                            });
                                            it('Запрос в сервер не был отправлен.', function() {
                                                ajax.expectNoRequestsToBeSent();
                                            });
                                        });
                                        it(
                                            'Получен такой же запрос поиска каналов. Ответ отправелен в родительское ' +
                                            'окно только один раз.',
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
                                        'В канале нет чатов. Получен запрос открытия чата с номером по которому ' +
                                        'производился поиск.',
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
                                            tester.groupChatsRequest().receiveResponse();

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

                                                tester.usersRequest().
                                                    forContacts().
                                                    forIframe().
                                                    receiveResponse();

                                                tester.chatInfoRequest().receiveResponse();

                                                tester.contactGroupsRequest().
                                                    forIframe().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    thirdChat().
                                                    receiveResponse();

                                                tester.contactGroupsRequest().
                                                    forIframe().
                                                    receiveResponse();

                                                tester.usersRequest().
                                                    forContacts().
                                                    forIframe().
                                                    receiveResponse();
                                            });

                                            it(
                                                'Получен запрос отображения списка чатов. Список чатов отображён.',
                                            function() {
                                                tester.chatListOpeningRequest().receive();
                                                tester.button('В работе 75').click();
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
                                            tester.body.expectToHaveTextContent('UIS k');
                                        });
                                    });
                                });
                                xdescribe('Приходит новое сообщение.', function() {
                                    let notificationShowingRequest;

                                    beforeEach(function() {
                                        tester.newMessage().receive();

                                        notificationShowingRequest = tester.notificationShowingRequest().
                                            expectToBeSent();
                                    });

                                    it('Нажимаю на уведомление. Открыт чат.', function() {
                                        notificationShowingRequest.
                                            click().
                                            receive();

                                        tester.scheduledMessagesRequest().
                                            anotherChat().
                                            receiveResponse();

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();
                                            
                                        tester.chatInfoRequest().
                                            anotherChat().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.visitorCardRequest().receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            read().
                                            receiveResponse();

                                        tester.messageListRequest().receiveResponse();

                                        tester.chatListRequest().
                                            chat().
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

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();

                                        tester.chatInfoRequest().
                                            anotherChat().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            chat().
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
                                    });

                                    describe('Открываю список тегов.', function() {
                                        beforeEach(function() {
                                            tester.tagField.button.click();
                                        });

                                        describe('Создаю новый тег. Отправлен запрос проставления нового тега для открытого чата.', function() {
                                            let chatMarkingRequest;

                                            beforeEach(function() {
                                                tester.button('Создать тег').click();
                                                tester.modalWindow.endTransition('transform');

                                                tester.input.withPlaceholder('Введите название').fill('Новый тег');
                                                tester.button('Сохранить').click();

                                                tester.tagsCreatingRequest().receiveResponse();

                                                chatMarkingRequest = tester.chatMarkingRequest().
                                                    anotherChat().
                                                    addAnotherTag().
                                                    addThirdTag().
                                                    expectToBeSent();
                                            });

                                            it('Получен ответ на запрос создания тега.', function() {
                                                chatMarkingRequest.receiveResponse();

                                                tester.chatListRequest().
                                                    chat().
                                                    addAnotherTag().
                                                    receiveResponse();

                                                tester.tagField.button.click();

                                                tester.select.option('Нереализованная сделка').expectToBeSelected();
                                                tester.select.option('Скупка краденого').expectToBeSelected();
                                                tester.select.option('Новый тег').expectToBeSelected();
                                                tester.select.option('Продажа').expectNotToBeSelected();
                                            });
                                            it('Запрос данных чата не был отправлен.', function() {
                                                ajax.expectNoRequestsToBeSent();
                                            });
                                        });
                                        it('Отмечены теги, проставленные для открытого чата.', function() {
                                            tester.select.option('Нереализованная сделка').expectToBeSelected();
                                            tester.select.option('Скупка краденого').expectToBeSelected();
                                            tester.select.option('Продажа').expectNotToBeSelected();
                                        });
                                    });
                                    xit('Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.', function() {
                                        tester.chatHistory.
                                            header.
                                            closeButton.
                                            click();

                                        tester.chatsHidingRequest().expectToBeSent();
                                    });
                                    it('Нажимаю на иконку с крестиком в правой части одно из тегов.', function() {
                                        tester.tagField.
                                            tag('Скупка краденого').
                                            removeIcon.
                                            click();

                                        tester.chatMarkingRequest().
                                            anotherChat().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            chat().
                                            removeSecondTag().
                                            receiveResponse();

                                        tester.contactBar.expectTextContentToHaveSubstring(
                                            'Теги ' +
                                            'Нереализованная сделка'
                                        );

                                        tester.contactBar.expectTextContentNotToHaveSubstring('Скупка краденого');
                                    });
                                    it('Чат открыт.', function() {
                                        tester.contactBar.expectTextContentToHaveSubstring(
                                            'ФИО ' +
                                            'Помакова Бисерка Драгановна'
                                        );

                                        tester.contactBar.expectTextContentToHaveSubstring(
                                            'Теги ' +

                                            'Нереализованная сделка ' +
                                            '',
                                        );
                                    });
                                });
                                return;
                                it(
                                    'От родительского окна получен запрос поиска каналов. На сервер отправлен запрос ' +
                                    'каналов.',
                                function() {
                                    tester.channelsSearchingRequest().
                                        depricated().
                                        receive();

                                    tester.visitorExternalSearchingRequest().
                                        anotherToken().
                                        fourthSearchString().
                                        telegramPrivate().
                                        expectToBeSent();
                                });
                                it(
                                    'Приложение открыто в другом браузере. Отображено сообщение о том, что ' +
                                    'приложение открыто в другом браузере.',
                                function() {
                                    tester.chatsWebSocket.disconnect(4429);

                                    tester.body.expectToHaveTextContent(
                                        'UIS k ' +
                                        'Приложение открыто в другом браузере'
                                    );

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
                                it('Нажимаю на кнопку аккаунта. Кнопка выхода скрыта.', function() {
                                    tester.accountButton.click();
                                    tester.button('Выход').expectNotToExist();
                                });
                                it(
                                    
                                    'Получен запрос иконки. В родительское окно отправлена разметка иконки.',
                                function() {
                                    tester.iconRequest().expectResponseToBeSent();
                                });
                                it('Отображен список чатов.', function() {
                                    tester.chatList.
                                        first.
                                        item('Привет').
                                        expectToBeVisible();

                                    tester.spin.expectNotToExist();

                                    tester.body.expectTextContentNotToHaveSubstring(
                                        'Недостаточно прав на раздел чатов'
                                    );

                                    tester.body.expectTextContentToHaveSubstring(
                                        'Выберите чат слева для отображения переписки'
                                    );

                                    unfilteredPostMessages.
                                        nextMessage().
                                        expectMessageToStartsWith('ignore:log:').
                                        expectMessageToContain('Time consumed');
                                });
                            });
                            return;
                            it(
                                'Соединение с вебсокетом сотрудников потеряно. Соединение с вебсокетом сотрудников ' +
                                'восстановлено. Данные сотрудника перезапрошены.',
                            function() {
                                tester.employeesWebSocket.disconnect();
                                spendTime(1000);

                                tester.employeesWebSocket.connect();
                                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                                tester.employeesInitMessage().
                                    oauthToken().
                                    expectToBeSent();

                                tester.employeeRequest().
                                    oauthToken().
                                    receiveResponse();
                            });
                            it(
                                'Получен запрос открытости вебсокета. Отправлено состояние открытости вебсокета.',
                            function() {
                                tester.employeesWebsocketConnectedRequest().receive();
                                tester.employeesWebsocketConnectedMessage().expectToBeSent();
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

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.chatListRequest().
                                    chat().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    read().
                                    anotherMessage().
                                    receiveResponse();

                                tester.groupsContainingContactRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.groupsContainingContactRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.anchor('Бележкова Грета Ервиновна').expectNotToExist();
                                tester.anchor('79162729533').expectNotToExist();
                            });
                        });
                        return;
                        it('Получен запрос открытости вебсокета.', function() {
                            tester.employeesWebsocketConnectedRequest().receive();
                        });
                    });
                    return;
                    describe('Вкладка является ведомой.', function() {
                        beforeEach(function() {
                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                receive();

                            tester.employeesWebsocketConnectedRequest().expectToBeSent();
                            spendTime(2999);
                        });

                        describe(
                            'Получено сообщение об открытии вебсокета сотрудников. Отправлен запрос данных сотрудника.',
                        function() {
                            beforeEach(function() {
                                tester.employeesWebsocketConnectedMessage().receive();
                                tester.employeeSettingsRequest().receiveResponse();

                                tester.employeeRequest().
                                    oauthToken().
                                    receiveResponse();
                            });

                            it(
                                'Соединение с вебсокетом сотрудников потеряно. Соединение с вебсокетом сотрудников ' +
                                'восстановлено. Данные сотрудника перезапрошены.',
                            function() {
                                tester.employeesWebsocketConnectedMessage().receive();

                                tester.employeeRequest().
                                    oauthToken().
                                    receiveResponse();
                            });
                            it('Ведущая вкладка закрыта. Ведомая вкладка становится ведущей.', function() {
                                tester.employeesBroadcastChannel().
                                    leaderDeath().
                                    receive();

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

                                tester.employeeRequest().
                                    oauthToken().
                                    receiveResponse();
                            });
                            it('Ничего не происходит.', function() {
                                spendTime(1);

                                tester.employeesBroadcastChannel().
                                    applyLeader().
                                    expectToBeSent();

                                tester.employeesBroadcastChannel().
                                    tellIsLeader().
                                    receive();

                                tester.employeesBroadcastChannel().
                                    applyLeader().
                                    expectToBeSent();
                            });
                        });
                        it('Прошло некоторое время. Отправлен запрос данных сотрудника.', function() {
                            spendTime(1);
                            tester.employeeSettingsRequest().receiveResponse();

                            tester.employeeRequest().
                                oauthToken().
                                receiveResponse();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent();

                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                receive();

                            tester.employeesBroadcastChannel().
                                applyLeader().
                                expectToBeSent();
                        });
                        it('Ничего не происходит.', function() {
                            postMessages.nextMessage().expectNotToExist();
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                });
                return;
                it('Не удалось получить данные аккаунта. Чаты скрыты.', function() {
                    accountRequest.
                        failed().
                        receiveResponse();

                    unfilteredPostMessages.
                        nextMessage().
                        expectMessageToStartsWith('ignore:log:').
                        expectMessageToContain('Response status: 200 OK; Time consumed 0 ms; Without credentials');

                    tester.body.expectToHaveTextContent(
                        'UIS -- ' +
                        'Недостаточно прав на раздел чатов'
                    );

                    tester.closeButton.expectToBeVisible();
                });
                it('Чаты недоступны. Чаты скрыты.', function() {
                    accountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    postMessages.nextMessage().expectNotToExist();

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
                        noActiveChats().
                        receiveResponse();

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

                    unfilteredPostMessages.
                        nextMessage().
                        expectMessageToStartsWith('ignore:log:').
                        expectMessageToContain('POST https://$REACT_APP_BASE_URL/operator?method=get_chat_list').
                        expectMessageToContain('{"jsonrpc":"2.0","id":"number","method":"get_chat_list",');//}

                    tester.body.expectToHaveTextContent(
                        'UIS k ' +
                        'Недостаточно прав на раздел чатов'
                    );
                });
            });
            return;
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

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.channelsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

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
                    tester.employeesWebsocketConnectedMessage().expectToBeSent();

                    tester.employeesInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
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

                    tester.chatListRequest().
                        forCurrentEmployee().
                        noData().
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

                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        expectToBeSent();

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

                tester.employeeStatusesRequest().
                    anotherOauthToken().
                    expectToBeSent();

                tester.chatSettingsRequest().expectToBeSent();
                tester.channelsRequest().receiveResponse();
                tester.chatChannelListRequest().expectToBeSent();

                tester.listRequest().expectToBeSent();
                tester.siteListRequest().expectToBeSent();
                tester.messageTemplateListRequest().expectToBeSent();
                tester.commonMessageTemplatesRequest().expectToBeSent();
                tester.messageTemplatesSettingsRequest().expectToBeSent();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();
            });
        });
        return;
        describe('Открываю IFrame чатов amoCRM.', function() {
            let accountRequest,
                secondAccountRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmChatsIframeContent',
                    isIframe: true,
                    isAuthorized: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
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

                tester.unreadMessagesCountSettingRequest().expectToBeSent();

                accountRequest = tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                tester.chatSettingsRequest().receiveResponse();
                tester.channelsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();

                secondAccountRequest = tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    expectToBeSent();
            });

            describe('Удалось получить данные аккаунта.', function() {
                beforeEach(function() {
                    postMessages.nextMessage().expectNotToExist();

                    accountRequest.
                        operatorWorkplaceAvailable().
                        receiveResponse();

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

                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        expectToBeSent();

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

                    tester.body.expectTextContentToHaveSubstring('My chats');
                    tester.body.expectTextContentNotToHaveSubstring('Мои чаты');
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
                    noActiveChats().
                    receiveResponse();

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

                tester.body.expectToHaveTextContent(
                    'UIS k ' +
                    'Недостаточно прав на раздел чатов'
                );
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

                postMessages.
                    nextMessage().
                    expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });

                tester.unreadMessagesCountSettingRequest().expectToBeSent();
            });

            describe('В другом окне произошла авторизация.', function() {
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

                it('Чаты доступны. Производятся запросы данных для чатов.', function() {
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

                    const listRequest = tester.listRequest().expectToBeSent(requests);
                    const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                    const messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

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

                    requests = ajax.inAnyOrder();

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

                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        expectToBeSent();

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

                    tester.button('В работе 75').click();
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

                    tester.listRequest().expectToBeSent();
                    tester.siteListRequest().expectToBeSent();
                    tester.messageTemplateListRequest().expectToBeSent();
                    tester.commonMessageTemplatesRequest().expectToBeSent();
                    tester.messageTemplatesSettingsRequest().expectToBeSent();

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
                it('Чаты недоступны. Запросы данных для чатов не производятся.', function() {
                    widgetSettings.
                        unavailable().
                        receiveResponse();

                    tester.availabilitySettingRequest().
                        chats().
                        unavailable().
                        expectToBeSent();
                });
            });
            it('Отображено сообщение о том, что сотрудник не авторизован.', function() {
                tester.body.expectToHaveTextContent(
                    'Не авторизован ' +
                    'Для использования приложения необходимо авторизоваться'
                );
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

                    let requests = ajax.inAnyOrder();

                    const employeeStatusesRequest = tester.employeeStatusesRequest().
                        oauthToken().
                        expectToBeSent(requests);

                    const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                    const channelsRequest = tester.channelsRequest().expectToBeSent(requests);
                    const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

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
                    tester.employeesWebsocketConnectedMessage().expectToBeSent();

                    tester.employeesInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.chatsWebSocket.connect();

                    tester.chatsInitMessage().
                        oauthToken().
                        expectToBeSent();

                    requests = ajax.inAnyOrder();

                    const chatListRequest = tester.chatListRequest().
                        forCurrentEmployee().
                        noData().
                        expectToBeSent(requests);

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

                    chatListRequest.receiveResponse();
                    accountRequest.receiveResponse();
                    employeeSettingsRequest.receiveResponse();
                    employeeRequest.receiveResponse();

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        receiveResponse();

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
                                'Time consumed 0 ms; Without credentials' + "\n\n" +

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

                    tester.employeesBroadcastChannel().
                        leaderDeath().
                        expectToBeSent();
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
