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

        xdescribe('Открываю IFrame чатов. Получены настройки.', function() {
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

                tester.submoduleInitilizationEvent().
                    contacts().
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
                    tester.settingsAppRequest().receiveResponse();

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

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

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

                                tester.chatChannelSearchRequest().
                                    emptySearchString().
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
                                                        describe(
                                                            'Открываю список сотрудников для переадресации.',
                                                        function() {
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

                                                                tester.chatListRequest().
                                                                    forCurrentEmployee().
                                                                    noData().
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

                                                tester.scheduledMessagesRequest().receiveResponse();
                                                tester.visitorCardRequest().receiveResponse();
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
                                describe('Приходит новое сообщение.', function() {
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

                                        tester.changeMessageStatusRequest().
                                            read().
                                            anotherMessage().
                                            receiveResponse();

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
                                    let chatListRequest;

                                    beforeEach(function() {
                                        tester.chatList.
                                            first.
                                            item('Привет').
                                            click();

                                        tester.scheduledMessagesRequest().
                                            anotherChat().
                                            receiveResponse();

                                        tester.visitorCardRequest().receiveResponse();
                                        tester.messageListRequest().receiveResponse();

                                        tester.chatInfoRequest().
                                            anotherChat().
                                            receiveResponse();

                                        chatListRequest = tester.chatListRequest().
                                            chat().
                                            active().
                                            expectToBeSent();
                                    });

                                    describe('Для чата проставлено немного тегов.', function() {
                                        beforeEach(function() {
                                            chatListRequest.receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
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

                                            describe(
                                                'Создаю новый тег. Отправлен запрос проставления нового тега для ' +
                                                'открытого чата.',
                                            function() {
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
                                            it(
                                                'Отмечаю тег. Отмечены теги, проставленные для открытого чата. ' +
                                                'Закрываю окно выбора тегов. Отправлен запрос добавления тегов.',
                                            function() {
                                                tester.select.option('Продажа').click();
                                                ajax.expectNoRequestsToBeSent();

                                                tester.select.option('Нереализованная сделка').expectToBeSelected();
                                                tester.select.option('Скупка краденого').expectToBeSelected();
                                                tester.select.option('Продажа').expectToBeSelected();
                                                tester.select.option('Спам').expectNotToBeSelected();

                                                tester.tagField.
                                                    tag('Нереализованная сделка').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Скупка краденого').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Продажа').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Спам').
                                                    expectNotToExist();

                                                tester.chatHistory.
                                                    message.
                                                    atTime('12:13').
                                                    click();

                                                tester.chatMarkingRequest().
                                                    anotherChat().
                                                    addAnotherTag().
                                                    addFourthTag().
                                                    receiveResponse();

                                                tester.chatListRequest().
                                                    chat().
                                                    addThirdTag().
                                                    receiveResponse();

                                                tester.tagField.
                                                    tag('Нереализованная сделка').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Скупка краденого').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Продажа').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Спам').
                                                    expectNotToExist();
                                            });
                                            it('Отмечены теги, проставленные для открытого чата.', function() {
                                                tester.select.option('Нереализованная сделка').expectToBeSelected();
                                                tester.select.option('Скупка краденого').expectToBeSelected();
                                                tester.select.option('Продажа').expectNotToBeSelected();
                                                tester.select.option('Спам').expectNotToBeSelected();

                                                tester.tagField.
                                                    tag('Нереализованная сделка').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Скупка краденого').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Продажа').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Спам').
                                                    expectNotToExist();
                                            });
                                        });
                                        describe(
                                            'Нажимаю на иконку с крестиком в правой части одно из тегов.',
                                        function() {
                                            beforeEach(function() {
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
                                            });

                                            it('Открываю список тегов. Удалённый тег не отображается.', function() {
                                                tester.tagField.button.click();

                                                tester.select.option('Нереализованная сделка').expectToBeSelected();
                                                tester.select.option('Скупка краденого').expectNotToBeSelected();
                                                tester.select.option('Продажа').expectNotToBeSelected();
                                                tester.select.option('Спам').expectNotToBeSelected();

                                                tester.tagField.
                                                    tag('Нереализованная сделка').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Скупка краденого').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Продажа').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Спам').
                                                    expectNotToExist();
                                            });
                                            it('Тег удалён.', function() {
                                                tester.tagField.
                                                    tag('Нереализованная сделка').
                                                    expectToBeVisible();

                                                tester.tagField.
                                                    tag('Скупка краденого').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Продажа').
                                                    expectNotToExist();

                                                tester.tagField.
                                                    tag('Спам').
                                                    expectNotToExist();
                                            });
                                        });
                                        it('Ввожу сообщение. Прикладываю файл. Отправляю сообщение.', function() {
                                            tester.fileField.upload('some-file.zip');

                                            fileReader.
                                                accomplishFileLoading('some-file.zip');

                                            tester.sendIcon.click();
                                            tester.resourceRequest().receiveResponse();

                                            tester.messageAddingRequest().
                                                thirdChat().
                                                resource().
                                                receiveResponse();
                                        });
                                        it(
                                            'Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.',
                                        function() {
                                            tester.chatHistory.
                                                header.
                                                closeButton.
                                                click();

                                            tester.chatsHidingRequest().expectToBeSent();
                                        });
                                        it('Чат открыт.', function() {
                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Помакова Бисерка Драгановна'
                                            );

                                            tester.tagField.
                                                tag('Нереализованная сделка').
                                                expectToBeVisible();

                                            tester.tagField.
                                                tag('Скупка краденого').
                                                expectToBeVisible();

                                            tester.tagField.
                                                tag('Продажа').
                                                expectNotToExist();

                                            tester.tagField.
                                                tag('Спам').
                                                expectNotToExist();

                                            tester.tagField.
                                                tag('+2').
                                                expectNotToExist();
                                        });
                                    });
                                    it('Для чата проставлено много тегов.', function() {
                                        chatListRequest.
                                            addManyTags().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            read().
                                            anotherMessage().
                                            receiveResponse();

                                        tester.tagField.
                                            tag('+2').
                                            putMouseOver();

                                        tester.tooltip.expectToHaveTextContent('Не обработано, Обработано');

                                        tester.contactBar.
                                            title.
                                            closeButton.
                                            click();

                                        tester.chatMarkingRequest().
                                            anotherChat().
                                            addManyTags().
                                            expectToBeSent();
                                    });
                                });
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

                                    tester.body.expectTextContentToHaveSubstring(
                                        'k karadimova ' +
                                        'Доступен'
                                    );
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

                                tester.appVersionMessage().expectToBeSent();
                                tester.updateAvailableMessage().expectToBeSent();

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

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
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

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.anchor('Бележкова Грета Ервиновна').expectNotToExist();
                                tester.anchor('79162729533').expectNotToExist();
                            });
                        });
                        it('Получен запрос открытости вебсокета.', function() {
                            tester.employeesWebsocketConnectedRequest().receive();

                            tester.usersRequest().
                                forContacts().
                                forIframe().
                                receiveResponse();

                            tester.appVersionMessage().expectToBeSent();
                            tester.updateAvailableMessage().expectToBeSent();
                        });
                    });
                    describe('Вкладка является ведомой.', function() {
                        beforeEach(function() {
                            tester.employeesBroadcastChannel().
                                tellIsLeader().
                                receive();

                            tester.employeesWebsocketConnectedRequest().expectToBeSent();
                            spendTime(2999);

                            tester.usersRequest().
                                forContacts().
                                forIframe().
                                receiveResponse();
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
                describe('Не удалось получить данные аккаунта.', function() {
                    beforeEach(function() {
                        accountRequest.
                            failed().
                            receiveResponse();
                    });

                    it('Модуль РМО не смог получить данные аккаунта. Чаты скрыты.', function() {
                        secondAccountRequest.
                            failed().
                            receiveResponse();

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain('Response status: 200 OK; Time consumed 0 ms; Without credentials');

                        tester.body.expectToHaveTextContent(
                            'UIS -- ' +

                            'Отсутствует доступ к чатам и заявкам. Необходимо связать пользователя с сотрудником с ' +
                            'доступом к чатам и заявкам. ' +

                            'Настроить ' +
                            'Произошла ошибка сервера'
                        );

                        tester.closeButton.expectToBeVisible();
                    });
                    it('Чаты скрыты.', function() {
                        tester.body.expectToHaveTextContent(
                            'UIS -- ' +
                            'Произошла ошибка сервера'
                        );

                        tester.closeButton.expectToBeVisible();
                    });
                });
                it('Чаты недоступны. Чаты скрыты.', function() {
                    accountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    postMessages.nextMessage().expectNotToExist();

                    secondAccountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    tester.usersRequest().
                        forContacts().
                        forIframe().
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

                    tester.chatListRequest().forCurrentEmployee().
                        closed().
                        noData().
                        receiveResponse();

                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();

                    unfilteredPostMessages.
                        nextMessage().
                        expectMessageToStartsWith('ignore:log:').
                        expectMessageToContain('POST https://$REACT_APP_BASE_URL/operator/offline_message/list');

                    tester.body.expectToHaveTextContent(
                        'UIS k ' +
                        'Недостаточно прав на раздел чатов'
                    );
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
                    tester.settingsAppRequest().receiveResponse();

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

                    tester.usersRequest().
                        forContacts().
                        forIframe().
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
                        thirdSearchString().
                        telegramPrivate().
                        addTelegramPrivate().
                        noChat().
                        receiveResponse();

                    tester.channelsSearchingResponse().
                        addChannel().
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

                    tester.chatListRequest().forCurrentEmployee().
                        closed().
                        noData().
                        receiveResponse();

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        addWaba().
                        addThirdTelegramPrivate().
                        receiveResponse();

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
                tester.settingsAppRequest().receiveResponse();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();
            });
        });
        describe('Открываю IFrame чатов amoCRM.', function() {
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

                        xdescribe('Получен запрос открытия чата.', function() {
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
                        xdescribe('Нажимаю на кнопку аккаунта.', function() {
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
                        xdescribe('Получен запрос прикладывания файла.', function() {
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
                        xit('Получен запрос скачивания файла.', function() {
                            tester.fileDownloadingRequest().receive();

                            tester.resourcePayloadRequest().
                                thirdFile().
                                receiveResponse();

                            tester.downloadedFile.
                                expectToHaveName('some-file.zip').
                                expectToHaveContent('2gf0s82l24348s982');
                        });
                        xit('Получен запрос шаблонов WABA. Список шаблонов отправлен в родительское окно.', function() {
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
                        return;
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
                    return;
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
                return;
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
            return;
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
return;
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
                describe('Получен запрос каналов whatsApp.', function() {
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
                it('Получен дубайский токен. Авторизация не производится.', function() {
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
                    tester.body.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования приложения необходимо авторизоваться'
                    );
                });
            });
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
        describe('Открываю вложенный IFrame Битрикс Salesbot.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'bitrixSalesbotIframe',
                    isIframe: true,
                    ...options,
                });

                tester.bitrixSalesbotParamsSettingRequest().expectToBeSent();
            });

            describe('Получен токен авторизации.', function() {
                let accountRequest;

                beforeEach(function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });

                    tester.bitrixSalesbotParamsSettingRequest().
                        authorized().
                        expectToBeSent();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();
                });

                describe('Чаты доступны. Отправлен список каналов.', function() {
                    beforeEach(function() {
                        accountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain('Tab state is unknown');

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain(
                                'POST https://dev-int0-chats-logic.uis.st/v1/operator?method=get_account'
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

                        tester.chatChannelListRequest().receiveResponse();

                        tester.salesbotChannelsRequest().
                            bitrix().
                            expectResponseToBeSent();
                    });

                    it('Получен запрос шаблонов WABA. Список шаблонов отправлен в родительское окно.', function() {
                        const messageTemplatesRequest = tester.messageTemplatesRequest().receive();

                        tester.channelMessageTemplateListRequest().receiveResponse();
                        messageTemplatesRequest.expectResponseToBeSent();
                    });
                    it(
                        'Нажимаю на кнопку скачивания лога. В родительское окно отправлен запрос скачивания лога.',
                    function() {
                        tester.bugButton.click();

                        tester.logDownloadingRequest().
                            windowMessage().
                            expectToBeSent();
                    });
                    it('Нажимаю на кнопку выхода. Открыто окно выхода.', function() {
                        tester.logoutButton.click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix/logout');
                    });
                });
                describe('Чаты недоступны. Отправлено сообщение об ошибке.', function() {
                    beforeEach(function() {
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

                        tester.salesbotChannelsRequest().
                            disallowed().
                            expectResponseToBeSent();
                    });

                    it(
                        'Нажимаю на кнопку скачивания лога. В родительское окно отправлен запрос скачивания лога.',
                    function() {
                        tester.bugButton.click();

                        tester.logDownloadingRequest().
                            windowMessage().
                            expectToBeSent();
                    });
                    it('Нажимаю на кнопку выхода. Открыто окно выхода.', function() {
                        tester.logoutButton.click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix/logout');
                    });
                });
                describe('Не удалось получить данные аккаунта. Отправлено сообщение об ошибке.', function() {
                    beforeEach(function() {
                        accountRequest.
                            failed().
                            receiveResponse();

                        tester.salesbotChannelsRequest().
                            serverError().
                            expectResponseToBeSent();
                    });

                    it(
                        'Нажимаю на кнопку скачивания лога. В родительское окно отправлен запрос скачивания лога.',
                    function() {
                        tester.bugButton.click();

                        tester.logDownloadingRequest().
                            windowMessage().
                            expectToBeSent();
                    });
                    it('Нажимаю на кнопку выхода. Открыто окно выхода.', function() {
                        tester.logoutButton.click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix/logout');
                    });
                });
            });
            it('Нажимаю на кнопку скачивания лога. В родительское окно отправлен запрос скачивания лога.', function() {
                tester.bugButton.click();

                tester.logDownloadingRequest().
                    windowMessage().
                    expectToBeSent();
            });
            it('Нажимаю на ссылку на страницу авторизации. Открыта страница авторизации.', function() {
                tester.span('Для использования приложения необходимо авторизоваться').click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix');
            });
            it('Нажимаю на кнопку выхода. Открыто окно выхода.', function() {
                tester.logoutButton.click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/bitrix/logout');
            });
            it('Получена английская локаль. Отображён текст на английском.', function() {
                tester.localeSettingRequest().
                    en().
                    receive();

                tester.body.expectToHaveTextContent(
                    'Not authorized ' +
                    'Please authorize to use application'
                );
            });
            it('Отображено сообщение о том, что сотрудник не авторизован.', function() {
                tester.body.expectToHaveTextContent(
                    'Не авторизован ' +
                    'Для использования приложения необходимо авторизоваться'
                );
            });
        });
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
