tests.addTest(options => {
    const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
    } = options;

    describe('Открываю IFrame чатов.', function() {
        let tester,
            accountRequest,
            secondAccountRequest,
            visitorExternalSearchingRequest,
            chatChannelListRequest;

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();
            tester.restoreSoftphoneIFrameContentWindow();

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

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                application: 'chatsIframe',
                ...options,
            });

            tester.submoduleInitilizationEvent().
                operatorWorkplace().
                expectToBeSent();

            tester.submoduleInitilizationEvent().expectToBeSent();
            tester.unreadMessagesCountSettingRequest().expectToBeSent();

            tester.widgetSettings().
                windowMessage().
                chatsSettings().
                receive();

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
            chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent();
        });

        describe('Активны каналы всех трёх типов.', function() {
            beforeEach(function() {
                chatChannelListRequest.receiveResponse();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.commonMessageTemplatesRequest().receiveResponse();
                tester.messageTemplatesSettingsRequest().receiveResponse();
            });

            describe('Чужие чаты доступны.', function() {
                let chatListRequest,
                    chatChannelSearchRequest;

                beforeEach(function() {
                    accountRequest.
                        operatorWorkplaceAvailable().
                        otherEmployeeChatsAccessAvailable().
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
                        otherEmployeeChatsAccessAvailable().
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
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    chatChannelSearchRequest = tester.chatChannelSearchRequest().
                        emptySearchString().
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

                    chatListRequest = tester.chatListRequest().
                        forCurrentEmployee().
                        active().
                        expectToBeSent();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        closed().
                        noData().
                        receiveResponse();

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();
                });

                describe('Канал почты найден.', function() {
                    beforeEach(function() {
                        chatChannelSearchRequest.
                            addEmail().
                            receiveResponse();
                    });

                    describe('Один из чатов имеет канал типа Telegram Private.', function() {
                        beforeEach(function() {
                            chatListRequest.
                                telegramPrivate().
                                receiveResponse();
                        });

                        describe('Нажимаю на кнопку исходящего сообщения новому контакту.', function() {
                            beforeEach(function() {
                                tester.button('Написать новому клиенту').click();
                                tester.modalWindow.endTransition('transform');
                                
                                tester.chatChannelSearchRequest().
                                    emptySearchString().
                                    addEmail().
                                    receiveResponse();
                            });

                            describe('Ввожу номер нового клиента.', function() {
                                let visitorExternalSearchingRequest,
                                    chatChannelSearchRequest;

                                beforeEach(function() {
                                    tester.input.
                                        withPlaceholder('Введите номер').
                                        fill('79283810988');

                                    tester.button('Найти').click();

                                    visitorExternalSearchingRequest = tester.visitorExternalSearchingRequest().
                                        anotherToken().
                                        anotherSearchString().
                                        telegramPrivate().
                                        expectToBeSent();

                                    chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                        telegramPrivate();
                                });

                                describe('Чаты не найдены.', function() {
                                    beforeEach(function() {
                                        chatChannelSearchRequest.noChat();
                                    });

                                    describe(
                                        'Номер найден только в канале Tenegram Private. Номер найден в каналах ' +
                                        'Telegram Private и WhatsApp.',
                                    function() {
                                        beforeEach(function() {
                                            visitorExternalSearchingRequest.receiveResponse();

                                            chatChannelSearchRequest.
                                                addTelegramPrivate().
                                                addTelegram().
                                                addWhatsApp().
                                                receiveResponse();
                                        });

                                        describe('Раскрываю список каналов.', function() {
                                            beforeEach(function() {
                                                tester.modalWindow.select.click();
                                            });

                                            it('Нажимаю на опцию канала. Нажимаю на кнопку начатия чата.', function() {
                                                tester.select.
                                                    option('Нижний Новгород 79283810988').
                                                    click();

                                                tester.button('Начать чат').click();

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

                                                tester.chatStartingRequest().receiveResponse();

                                                tester.chatListRequest().
                                                    thirdChat().
                                                    receiveResponse();

                                                tester.submoduleInitilizationEvent().
                                                    contacts().
                                                    expectToBeSent();

                                                tester.visitorCardRequest().receiveResponse();
                                                tester.scheduledMessagesRequest().receiveResponse();
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
                                            it('В списке отображёны каналы Telegram Private.', function() {
                                                tester.select.
                                                    popup.
                                                    expectToHaveTextContent(
                                                        'Нижний Новгород 79283810988 ' +
                                                        'Белгород 79283810988'
                                                    );
                                            });
                                        });
                                        describe(
                                            'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку ' +
                                            'исходящего сообщения новому контакту.',
                                        function() {
                                            beforeEach(function() {
                                                tester.modalWindow.closeButton.click();

                                                tester.button('Написать новому клиенту').click();
                                                tester.modalWindow.endTransition('transform');

                                                tester.chatChannelSearchRequest().
                                                    emptySearchString().
                                                    receiveResponse();
                                            });

                                            it(
                                                'Ввожу номер нового клиента. Сообщение об ошибке не отображается.',
                                            function() {
                                                tester.input.
                                                    withPlaceholder('Введите номер').
                                                    fill('79283810988');

                                                tester.input.
                                                    withPlaceholder('Введите номер').
                                                    expectNotToHaveError();
                                            });
                                            it(
                                                'Открываю выпадающий список каналов. В нем нет ни одного канала.',
                                            function() {
                                                tester.select.click();

                                                tester.select.
                                                    popup.
                                                    expectNotToExist();
                                            });
                                            it('Отображены все три типа канала.', function() {
                                                tester.modalWindow.button('WhatsApp').expectNotToExist();
                                                tester.modalWindow.button('WABA').expectNotToExist();
                                                tester.modalWindow.button('Telegram').expectNotToExist();

                                                tester.input.
                                                    withPlaceholder('Введите номер').
                                                    expectToHaveValue('');
                                            });
                                        });
                                        it('Кнопки типов каналов отсутсвтуют.', function() {
                                            tester.modalWindow.button('Начать чат').expectToBeEnabled();

                                            tester.modalWindow.button('WhatsApp').expectNotToExist();
                                            tester.modalWindow.button('WABA').expectNotToExist();
                                            tester.modalWindow.button('Telegram').expectNotToExist();

                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                expectNotToHaveError();
                                        });
                                    });
                                    describe('Номер найден в каналах Telegram Private и WhatsApp.', function() {
                                        beforeEach(function() {
                                            visitorExternalSearchingRequest.
                                                addWhatsApp().
                                                receiveResponse();
                                        });

                                        describe('Номер найден в каналах Telegram Private и WhatsApp.', function() {
                                            beforeEach(function() {
                                                chatChannelSearchRequest.
                                                    addWhatsApp().
                                                    addTelegramPrivate().
                                                    receiveResponse();
                                            });

                                            describe('Раскрываю список каналов.', function() {
                                                beforeEach(function() {
                                                    tester.modalWindow.select.click();
                                                });

                                                describe('Выбираю канал.', function() {
                                                    beforeEach(function() {
                                                        tester.select.
                                                            option('Нижний Новгород 79283810988').
                                                            click();
                                                    });

                                                    it('Ввожу другой номер телефона. Канал не выбран.', function() {
                                                        tester.input.
                                                            withPlaceholder('Введите номер').
                                                            fill('79283810989');

                                                        tester.modalWindow.
                                                            select.
                                                            expectToHaveTextContent('Выберите канал *');

                                                        tester.button('Начать чат').expectToBeDisabled();

                                                        tester.modalWindow.select.click();

                                                        tester.modalWindow.
                                                            select.
                                                            popup.
                                                            expectNotToExist();
                                                    });
                                                    it('Канал выбран.', function() {
                                                        tester.modalWindow.
                                                            select.
                                                            expectToHaveTextContent(
                                                                'Нижний Новгород 79283810988 ' +
                                                                'Выберите канал *'
                                                            );

                                                        tester.button('Начать чат').expectToBeEnabled();
                                                    });
                                                });
                                                it('В списке отображены все каналы.', function() {
                                                    tester.select.
                                                        popup.
                                                        expectToHaveTextContent(
                                                            'Нижний Новгород 79283810988 ' +
                                                            'Якутск 79283810988 ' +
                                                            'Белгород 79283810988'
                                                        );
                                                });
                                            });
                                            it('Кнопки типов каналов отсутствуют.', function() {
                                                tester.modalWindow.button('WhatsApp').expectNotToExist();
                                                tester.modalWindow.button('WABA').expectNotToExist();
                                                tester.modalWindow.button('Telegram').expectNotToExist();
                                            });
                                        });
                                        it(
                                            'Номер найден только в канале Telegram Private. Отображен только тип ' +
                                            'канала Telegram Private.',
                                        function() {
                                            chatChannelSearchRequest.receiveResponse();

                                            tester.modalWindow.button('WhatsApp').expectNotToExist();
                                            tester.modalWindow.button('WABA').expectNotToExist();
                                            tester.modalWindow.button('Telegram').expectNotToExist();
                                        });
                                    });
                                    describe('Номер не найден ни в одном канале.', function() {
                                        beforeEach(function() {
                                            visitorExternalSearchingRequest.noData().receiveResponse();
                                            chatChannelSearchRequest.receiveResponse();
                                        });

                                        it(
                                            'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку ' +
                                            'исходящего сообщения новому контакту. Сообщение об ошибке не отображено.',
                                        function() {
                                            tester.modalWindow.closeButton.click();

                                            tester.button('Написать новому клиенту').click();
                                            tester.modalWindow.endTransition('transform');

                                            tester.chatChannelSearchRequest().
                                                emptySearchString().
                                                receiveResponse();

                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                expectToHaveError('');
                                        });
                                        it('Ввожу другой номер телефона.', function() {
                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                fill('79283810989');

                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                expectNotToHaveError();
                                        });
                                        it('Отображено сообщение об ошибке.', function() {
                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                expectToHaveError('Номер не найден');
                                        });
                                    });
                                });
                                describe('Чаты найдены.', function() {
                                    beforeEach(function() {
                                        visitorExternalSearchingRequest.receiveResponse();
                                        chatChannelSearchRequest.addTelegramPrivate();
                                    });

                                    describe('В одном из каналов первый чат является чужим.', function() {
                                        beforeEach(function() {
                                            chatChannelSearchRequest.anotherEmployee();
                                        });

                                        describe('Чужой чат недоступен.', function() {
                                            beforeEach(function() {
                                                chatChannelSearchRequest.chatUnavailable();
                                            });

                                            describe(
                                                'Чужой чат является активным. В канале нет других чатов кроме ' +
                                                'чужого. Раскрываю список каналов.',
                                            function() {
                                                beforeEach(function() {
                                                    chatChannelSearchRequest.receiveResponse();
                                                    tester.modalWindow.select.click();
                                                });

                                                it(
                                                    'Помещаю курсор мыши над доступной опцией. Сообщение об ошибке ' +
                                                    'не отображено.',
                                                function() {
                                                    tester.select.
                                                        option('Белгород 79283810988').
                                                        putMouseOver();

                                                    tester.select.
                                                        option('Белгород 79283810988').
                                                        tooltipTrigger.
                                                        expectNotToExist();

                                                    tester.waitForTooltip().expectNotToExist();
                                                });
                                                it(
                                                    'Помещаю курсор мыши над заблокированной опцией. Отображено ' +
                                                    'сообщение об ошибке.',
                                                function() {
                                                    tester.select.
                                                        option('Нижний Новгород 79283810988').
                                                        tooltipTrigger.
                                                        putMouseOver();

                                                    tester.waitForTooltip().expectToHaveTextContent(
                                                        'По этим контактным данным уже был создан чат другим оператором'
                                                    );
                                                });
                                                it('Некоторые опции каналов заблокированы.', function() {
                                                    tester.select.
                                                        option('Нижний Новгород 79283810988').
                                                        expectToBeDisabled();

                                                    tester.select.
                                                        option('Белгород 79283810988').
                                                        expectToBeEnabled();
                                                });
                                            });
                                            it(
                                                'Чужой чат является активным. В канале помимо чужого чата есть ещё и ' +
                                                'свой закрытый. Опция канала заблокирована.',
                                            function() {
                                                chatChannelSearchRequest.
                                                    addClosedChat().
                                                    receiveResponse();

                                                tester.modalWindow.select.click();

                                                tester.select.
                                                    option('Нижний Новгород 79283810988').
                                                    expectToBeDisabled();

                                                tester.select.
                                                    option('Белгород 79283810988').
                                                    expectToBeEnabled();
                                            });
                                            it('Чужой чат является закрытым. Опция канала доступна.', function() {
                                                chatChannelSearchRequest.
                                                    closed().
                                                    receiveResponse();

                                                tester.modalWindow.select.click();

                                                tester.select.
                                                    option('Нижний Новгород 79283810988').
                                                    expectToBeEnabled();

                                                tester.select.
                                                    option('Белгород 79283810988').
                                                    expectToBeEnabled();
                                            });
                                        });
                                        describe('Чужой чат доступен. Раскрываю список каналов.', function() {
                                            beforeEach(function() {
                                                chatChannelSearchRequest.
                                                    addAnotherEmployeeUnavailableClosedChat().
                                                    receiveResponse();

                                                tester.modalWindow.select.click();
                                            });

                                            describe('Выбираю канал.', function() {
                                                let newChatList,
                                                    activeChatList,
                                                    closedChatList,
                                                    otherChatList;

                                                beforeEach(function() {
                                                    tester.select.
                                                        option('Нижний Новгород 79283810988').
                                                        click();

                                                    tester.button('Перейти к чату').click();

                                                    newChatList = tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        expectToBeSent();

                                                    activeChatList = tester.chatListRequest().
                                                        active().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        expectToBeSent();

                                                    closedChatList = tester.chatListRequest().
                                                        closed().
                                                        forCurrentEmployee().
                                                        expectToBeSent();

                                                    otherChatList = tester.chatListRequest().
                                                        active().
                                                        forCurrentEmployee().
                                                        isOtherEmployeesAppeals().
                                                        expectToBeSent();
                                                });

                                                it('Открыт активный чат.', function() {
                                                    newChatList.receiveResponse();
                                                    activeChatList.receiveResponse();
                                                    closedChatList.receiveResponse();
                                                    otherChatList.receiveResponse();

                                                    tester.chatListRequest().
                                                        thirdChat().
                                                        receiveResponse();

                                                    tester.messageListRequest().receiveResponse();
                                                    tester.visitorCardRequest().receiveResponse();

                                                    tester.submoduleInitilizationEvent().
                                                        contacts().
                                                        expectToBeSent();

                                                    tester.scheduledMessagesRequest().receiveResponse();
                                                    tester.chatInfoRequest().receiveResponse();
                                                        
                                                    tester.usersRequest().
                                                        forContacts().
                                                        forIframe().
                                                        receiveResponse();

                                                    tester.contactGroupsRequest().
                                                        forIframe().
                                                        receiveResponse();

                                                    tester.spin.expectNotToExist();

                                                    tester.chatList.
                                                        first.
                                                        item('Привет').
                                                        expectToBeVisible();
                                                });
                                                it('Отображён спиннер.', function() {
                                                    tester.spin.expectToBeVisible();
                                                });
                                            });
                                            it('Все опции каналов доступны.', function() {
                                                tester.spin.expectNotToExist();

                                                tester.select.
                                                    option('Нижний Новгород 79283810988').
                                                    expectToBeEnabled();

                                                tester.select.
                                                    option('Белгород 79283810988').
                                                    expectToBeEnabled();
                                            });
                                        });
                                        it(
                                            'Найден чужой закрытый чат. Выбираю канал. Нажимаю на кнопку начатия ' +
                                            'чата. Открыт чат.',
                                        function() {
                                            chatChannelSearchRequest.
                                                closed().
                                                receiveResponse();

                                            tester.modalWindow.select.click();

                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                click();

                                            tester.button('Начать чат').click();

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

                                            tester.chatStartingRequest().receiveResponse();

                                            tester.chatListRequest().
                                                thirdChat().
                                                receiveResponse();

                                            tester.submoduleInitilizationEvent().
                                                contacts().
                                                expectToBeSent();

                                            tester.visitorCardRequest().receiveResponse();
                                            tester.scheduledMessagesRequest().receiveResponse();
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
                                    });
                                    describe('Найден свой закрытый чат.', function() {
                                        beforeEach(function() {
                                            chatChannelSearchRequest.closed();
                                        });

                                        it(
                                            'Найден также недоступный закрытый чужой чат. Нажимаю на кнопку начатия ' +
                                            'чата. Открыт чат.',
                                        function() {
                                            chatChannelSearchRequest.
                                                addAnotherEmployeeUnavailableClosedChat().
                                                receiveResponse();

                                            tester.modalWindow.select.click();

                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                click();

                                            tester.button('Перейти к чату').click();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                active().
                                                forCurrentEmployee().
                                                secondPage().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                closed().
                                                forCurrentEmployee().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                active().
                                                forCurrentEmployee().
                                                isOtherEmployeesAppeals().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                thirdChat().
                                                receiveResponse();

                                            tester.messageListRequest().receiveResponse();
                                            tester.visitorCardRequest().receiveResponse();
                                            tester.scheduledMessagesRequest().receiveResponse();
                                            tester.chatInfoRequest().receiveResponse();

                                            tester.submoduleInitilizationEvent().
                                                contacts().
                                                expectToBeSent();
                                                
                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();
                                        });
                                        it(
                                            'Найден также недоступный активный чужой чат. Опция канала с чужим чатом ' +
                                            'заблокирована.',
                                        function() {
                                            chatChannelSearchRequest.
                                                addAnotherEmployeeUnavailableActiveChat().
                                                receiveResponse();

                                            tester.modalWindow.select.click();

                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                expectToBeDisabled();

                                            tester.select.
                                                option('Белгород 79283810988').
                                                expectToBeEnabled();
                                        });
                                    });
                                    describe('Найден новый чат. Раскрываю список каналов.', function() {
                                        beforeEach(function() {
                                            chatChannelSearchRequest.
                                                new().
                                                receiveResponse();

                                            tester.modalWindow.select.click();
                                        });

                                        it(
                                            'Помещаю курсор мыши над заблокированной опцией. Отображено сообщение об ' +
                                            'ошибке.',
                                        function() {
                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                tooltipTrigger.
                                                putMouseOver();

                                            tester.waitForTooltip().expectToHaveTextContent(
                                                'По этим контактным данным уже был создан чат, его можно найти во ' +
                                                'вкладке "Новые"'
                                            );
                                        });
                                        it('Канал с новым чатом заблокирован.', function() {
                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                expectToBeDisabled();

                                            tester.select.
                                                option('Белгород 79283810988').
                                                expectToBeEnabled();

                                            tester.spin.expectNotToExist();
                                        });
                                    });
                                });
                                it('Отображён спиннер.', function() {
                                    tester.spin.expectToBeVisible();
                                });
                            });
                            describe('Выбираю тип Email.', function() {
                                beforeEach(function() {
                                    tester.button('Email').click();

                                    tester.input.
                                        withPlaceholder('Введите email').
                                        fill('tomova@gmail.com');

                                    tester.button('Найти').click();

                                    tester.visitorExternalSearchingRequest().
                                        anotherToken().
                                        email().
                                        receiveResponse();

                                    tester.chatChannelSearchRequest().
                                        email().
                                        noChat().
                                        receiveResponse();
                                });
                                
                                it('Нажимаю на кнопку начатия чата. Чат начат.', function() {
                                    tester.button('Начать чат').click();

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
                                        email().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        thirdChat().
                                        receiveResponse();

                                    tester.submoduleInitilizationEvent().
                                        contacts().
                                        expectToBeSent();

                                    tester.visitorCardRequest().receiveResponse();
                                    tester.scheduledMessagesRequest().receiveResponse();
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
                                it('Выбран канал типа Email.', function() {
                                    tester.modalWindow.
                                        select.
                                        expectToHaveTextContent(
                                            'Дели 79283810988 ' +
                                            'Выберите канал *'
                                        );
                                });
                            });
                            it('Открываю выпадающий список каналов. В нем нет ни одного канала.', function() {
                                tester.select.click();

                                tester.select.
                                    popup.
                                    expectNotToExist();
                            });
                            it('Кнопки типов каналов скрыты.', function() {
                                tester.modalWindow.button('WhatsApp').expectNotToExist();
                                tester.modalWindow.button('WABA').expectNotToExist();
                                tester.modalWindow.button('Telegram').expectNotToExist();
                            });
                        });
                        describe('Открываю чат. Нажимаю на опцию канала связи.', function() {
                            let chatChannelSearchRequest;

                            beforeEach(function() {
                                tester.button('В работе 75').click();

                                tester.chatList.
                                    item('Привет').
                                    click();

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.visitorCardRequest().receiveResponse();

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.messageListRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.usersRequest().
                                    forIframe().
                                    forContacts().
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

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79164725823').
                                    click();

                                tester.visitorExternalSearchingRequest().
                                    anotherToken().
                                    sixthSearchString().
                                    telegramPrivate().
                                    receiveResponse();

                                chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                    fifthSearchString().
                                    telegramPrivate().
                                    addAnotherWhatsApp().
                                    expectToBeSent();
                            });

                            describe('Найдено два канала Telegram.', function() {
                                beforeEach(function() {
                                    chatChannelSearchRequest.addTelegramPrivate();
                                });

                                describe('Каналы доступны.', function() {
                                    beforeEach(function() {
                                        chatChannelSearchRequest.receiveResponse();
                                    });

                                    describe('Нажимаю на опцию канала.', function() {
                                        beforeEach(function() {
                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                click();
                                        });

                                        it('Нажимаю на кнопку перехода в чат. Открыт чат канала.', function() {
                                            tester.button('Перейти к чату').click();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                noData().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                secondPage().
                                                forCurrentEmployee().
                                                telegramPrivate().
                                                active().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                closed().
                                                noData().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                active().
                                                noData().
                                                forCurrentEmployee().
                                                isOtherEmployeesAppeals().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                thirdChat().
                                                receiveResponse();

                                            tester.messageListRequest().receiveResponse();
                                            tester.visitorCardRequest().receiveResponse();
                                            tester.scheduledMessagesRequest().receiveResponse();
                                            tester.chatInfoRequest().receiveResponse();

                                            tester.button('Отменить').expectNotToExist();

                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Помакова Бисерка Драгановна'
                                            );
                                        });
                                        it('Канал выбран.', function() {
                                            tester.select.
                                                option('Нижний Новгород 79283810988').
                                                expectToHaveClass(
                                                    'misc-chats-src-components-chats-channel-search-start-channel-' +
                                                    'select-styles-module__selected'
                                                );

                                            tester.select.
                                                option('Белгород 79283810988').
                                                expectNotToHaveClass(
                                                    'misc-chats-src-components-chats-channel-search-start-channel-' +
                                                    'select-styles-module__selected'
                                                );
                                        });
                                    });
                                    it(
                                        'Нажимаю на что-нибудь вне окна списка каналов. Окно списка каналов скрыто',
                                    function() {
                                        tester.chatHistory.
                                            message.
                                            atTime('12:13').
                                            click();

                                        tester.button('Отменить').expectNotToExist();
                                    });
                                    it('Нажимаю на кнопку отмены. Окно списка каналов скрыто.', function() {
                                        tester.button('Отменить').click();
                                        tester.button('Отменить').expectNotToExist();
                                    });
                                    it('Открыт список каналов.', function() {
                                        tester.select.
                                            option('Нижний Новгород 79283810988').
                                            expectToBeVisible();

                                        tester.select.
                                            option('Белгород 79283810988').
                                            expectToBeVisible();

                                        tester.select.
                                            option('Белград 79283810988').
                                            expectNotToExist();

                                        tester.select.
                                            option('Нижний Новгород 79283810988').
                                            icon.
                                            expectToHaveIcon('SourceTelegram20');

                                        tester.select.
                                            option('Нижний Новгород 79283810988').
                                            expectNotToHaveClass(
                                                'misc-contacts-src-components-contact-bar-start-channel-select-' +
                                                'styles-module__selected'
                                            );

                                        tester.notificationWindow.expectNotToExist();
                                        tester.spin.expectNotToExist();
                                        tester.button('Выбрать').expectToBeDisabled();
                                    });
                                });
                                describe('Один из каналов недоступен.', function() {
                                    beforeEach(function() {
                                        chatChannelSearchRequest.
                                            anotherEmployee().
                                            chatUnavailable().
                                            receiveResponse();
                                    });

                                    it(
                                        'Помещаю курсор над заблокированной опцией. Отображена подсказка с ' +
                                        'сообщением об ошибке.',
                                    function() {
                                        tester.select.
                                            option('Нижний Новгород 79283810988').
                                            tooltipTrigger.
                                            putMouseOver();

                                        tester.waitForTooltip().expectToHaveTextContent(
                                            'По этим контактным данным уже был создан чат другим оператором'
                                        );
                                    });
                                    it('Опция канала заблокирован.', function() {
                                        tester.select.
                                            option('Нижний Новгород 79283810988').
                                            expectToBeDisabled();

                                        tester.select.
                                            option('Белгород 79283810988').
                                            expectToBeEnabled();
                                    });
                                });
                                it('Выбираю канал без чатов.', function() {
                                    chatChannelSearchRequest.
                                        noChat().
                                        receiveResponse();

                                    tester.select.
                                        option('Нижний Новгород 79283810988').
                                        click();

                                    tester.button('Начать чат').expectToBeEnabled();
                                });
                                it('Отображён спиннер.', function() {
                                    tester.spin.expectToBeVisible();
                                });
                            });
                            it('Найден только один канал Telegram. Открыт чат найденного канала.', function() {
                                chatChannelSearchRequest.receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    noData().
                                    receiveResponse();

                                tester.chatListRequest().
                                    secondPage().
                                    forCurrentEmployee().
                                    telegramPrivate().
                                    active().
                                    receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    closed().
                                    noData().
                                    receiveResponse();

                                tester.chatListRequest().
                                    active().
                                    noData().
                                    forCurrentEmployee().
                                    isOtherEmployeesAppeals().
                                    receiveResponse();

                                tester.chatListRequest().
                                    thirdChat().
                                    receiveResponse();

                                tester.messageListRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.scheduledMessagesRequest().receiveResponse();
                                tester.chatInfoRequest().receiveResponse();

                                tester.button('Отменить').expectNotToExist();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Помакова Бисерка Драгановна'
                                );
                            });
                            it(
                                'Найден только один недоступный канал Telegram. Опция канала заблокирована.',
                            function() {
                                chatChannelSearchRequest.
                                    anotherEmployee().
                                    chatUnavailable().
                                    receiveResponse();

                                tester.select.
                                    option('Нижний Новгород 79283810988').
                                    expectToBeDisabled();
                            });
                        });
                        it('Скрываю приложение. Приходит новое сообщение. Отображено уведомление.', function() {
                            setFocus(false);
                            tester.newMessage().receive();

                            tester.chatListRequest().
                                chat().
                                receiveResponse();

                            tester.countersRequest().
                                noNewChats().
                                noClosedChats().
                                receiveResponse();

                            const notification = notificationTester.
                                grantPermission().
                                recentNotification();

                            notification.click();
                            tester.visitorCardRequest().receiveResponse();

                            tester.scheduledMessagesRequest().
                                anotherChat().
                                receiveResponse();

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

                            tester.submoduleInitilizationEvent().
                                contacts().
                                expectToBeSent();

                            tester.contactBar.expectTextContentToHaveSubstring(
                                'ФИО ' +
                                'Помакова Бисерка Драгановна'
                            );
                        });
                    });
                    describe(
                        'Один из чатов имеет канал типа WhatsApp. Открываю чат. Нажимаю на опцию канала. Найдены ' +
                        'каналы типов Waba и WhatsApp.',
                    function() {
                        let visitorExternalSearchingRequest,
                            chatChannelSearchRequest;

                        beforeEach(function() {
                            chatListRequest.
                                whatsApp().
                                receiveResponse();

                            tester.button('В работе 75').click();

                            tester.chatList.
                                item('Привет').
                                click();

                            tester.submoduleInitilizationEvent().
                                contacts().
                                expectToBeSent();

                            tester.visitorCardRequest().receiveResponse();

                            tester.scheduledMessagesRequest().
                                anotherChat().
                                receiveResponse();

                            tester.messageListRequest().receiveResponse();

                            tester.chatInfoRequest().
                                anotherChat().
                                receiveResponse();

                            tester.usersRequest().
                                forIframe().
                                forContacts().
                                receiveResponse();

                            tester.contactGroupsRequest().
                                forIframe().
                                receiveResponse();

                            tester.contactGroupsRequest().
                                forIframe().
                                receiveResponse();

                            tester.usersRequest().
                                forIframe().
                                forContacts().
                                receiveResponse();

                            tester.changeMessageStatusRequest().
                                read().
                                anotherMessage().
                                receiveResponse();

                            tester.countersRequest().
                                noNewChats().
                                noClosedChats().
                                receiveResponse();

                            tester.contactBar.
                                section('Каналы связи').
                                option('79164725823').
                                click();

                            visitorExternalSearchingRequest = tester.visitorExternalSearchingRequest().
                                anotherToken().
                                sixthSearchString().
                                expectToBeSent();

                            chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                fifthSearchString().
                                telegramPrivate().
                                addWaba().
                                addAnotherWhatsApp().
                                addThirdTelegramPrivate();
                        });
                        
                        describe('Найден чат WhatsApp.', function() {
                            beforeEach(function() {
                                visitorExternalSearchingRequest.whatsApp();
                            });

                            describe('Не найден чат Waba.', function() {
                                beforeEach(function() {
                                    visitorExternalSearchingRequest.receiveResponse();
                                    chatChannelSearchRequest.receiveResponse();
                                });

                                it('Помещаю курсор над опцией канала Waba. Отобржено сообщение об ошибке.', function() {
                                    tester.select.
                                        option('Южно-Сахалинск 79283810988').
                                        tooltipTrigger.
                                        putMouseOver();

                                    tester.waitForTooltip().
                                        expectToHaveTextContent('Номер не найден в канале');
                                });
                                it('Опция канала Waba заблокирована.', function() {
                                    tester.select.
                                        option('Южно-Сахалинск 79283810988').
                                        expectToBeDisabled();

                                    tester.select.
                                        option('Белград 79283810988').
                                        expectToBeEnabled();
                                });
                            });
                            it('Чат Waba найден. Опция канала Waba доступна.', function() {
                                visitorExternalSearchingRequest.
                                    addWaba().
                                    receiveResponse();

                                chatChannelSearchRequest.receiveResponse();

                                tester.select.
                                    option('Южно-Сахалинск 79283810988').
                                    expectToBeEnabled();

                                tester.select.
                                    option('Белград 79283810988').
                                    expectToBeEnabled();
                            });
                        });
                        it(
                            'Не найден ни чат WhatsApp ни чат Waba. Отображено сообщение об отсутвии каналов.',
                        function() {
                            visitorExternalSearchingRequest.receiveResponse();
                            chatChannelSearchRequest.receiveResponse();

                            tester.notificationWindow.expectToHaveTextContent('Нет активных каналов');
                        });
                    });
                });
                it('Канал почты не  найден.', function() {
                    chatChannelSearchRequest.receiveResponse();

                    tester.button('Написать новому клиенту').click();
                    tester.modalWindow.endTransition('transform');

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        receiveResponse();

                    tester.button('Email').expectNotToExist();
                });
            });
            it(
                'Чужие чаты недоступны. Нажимаю на кнопку исходящего сообщения новому контакту. Канал с активным ' +
                'чужим чатом недоступен.',
            function() {
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
                    softphoneFeatureFlagDisabled().
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

                tester.button('Написать новому клиенту').click();
                tester.modalWindow.endTransition('transform');

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    receiveResponse();

                tester.input.
                    withPlaceholder('Введите номер').
                    fill('79283810988');

                tester.button('Найти').click();

                tester.visitorExternalSearchingRequest().
                    anotherToken().
                    anotherSearchString().
                    telegramPrivate().
                    receiveResponse();

                tester.chatChannelSearchRequest().
                    telegramPrivate().
                    addTelegramPrivate().
                    anotherEmployee().
                    receiveResponse();

                tester.modalWindow.select.click();

                tester.select.
                    option('Нижний Новгород 79283810988').
                    expectToBeDisabled();

                tester.select.
                    option('Белгород 79283810988').
                    expectToBeEnabled();
            });
        });
        it('Активен только канал WhatsApp. Кнопки типов каналов скрыты.', function() {
            chatChannelListRequest.
                wabaInactive().
                telegramInactive().
                receiveResponse();

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
                otherEmployeeChatsAccessAvailable().
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
                otherEmployeeChatsAccessAvailable().
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
                softphoneFeatureFlagDisabled().
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

            tester.button('Написать новому клиенту').click();
            tester.modalWindow.endTransition('transform');

            tester.chatChannelSearchRequest().
                emptySearchString().
                receiveResponse();

            tester.modalWindow.button('WhatsApp').expectNotToExist();
            tester.modalWindow.button('WABA').expectNotToExist();
            tester.modalWindow.button('Telegram').expectNotToExist();
        });
    });
});
