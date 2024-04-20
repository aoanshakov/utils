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
            searchResultsRequest;

        afterEach(function() {
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

        describe('Чужие чаты доступны. Нажимаю на кнопку исходящего сообщения новому контакту.', function() {
            beforeEach(function() {
                accountRequest.
                    operatorWorkplaceAvailable().
                    otherEmployeeChatsAccessAvailable().
                    receiveResponse();

                tester.masterInfoMessage().receive();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                secondAccountRequest.
                    operatorWorkplaceAvailable().
                    otherEmployeeChatsAccessAvailable().
                    receiveResponse();

                tester.employeesWebSocket.connect();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

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

                tester.button('Написать новому клиенту').click();
                tester.modalWindow.endTransition('transform');
            });

            describe('Ввожу номер нового клиента.', function() {
                let searchResultsRequest,
                    chatChannelSearchRequest;

                beforeEach(function() {
                    tester.input.
                        withPlaceholder('Введите номер').
                        fill('79283810988').
                        pressEnter();

                    searchResultsRequest = tester.searchResultsRequest().
                        anotherToken().
                        anotherSearchString().
                        newVisitor().
                        telegramPrivate().
                        expectToBeSent();

                    chatChannelSearchRequest = tester.chatChannelSearchRequest().
                        telegramPrivate().
                        expectToBeSent();
                });

                describe('Чаты не найдены.', function() {
                    beforeEach(function() {
                        chatChannelSearchRequest.noChat();
                    });

                    describe(
                        'Номер найден только в канале Tenegram Private. Номер найден в каналах Telegram Private и ' +
                        'WhatsApp.',
                    function() {
                        beforeEach(function() {
                            searchResultsRequest.receiveResponse();

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
                                    option('Нижний Новгород').
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
                                tester.chatInfoRequest().receiveResponse();
                            });
                            it('В списке отображёны каналы Telegram Private.', function() {
                                tester.select.
                                    popup.
                                    expectToHaveTextContent(
                                        'Нижний Новгород ' +
                                        'Белгород'
                                    );
                            });
                        });
                        describe(
                            'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку исходящего сообщения ' +
                            'новому контакту.',
                        function() {
                            beforeEach(function() {
                                tester.modalWindow.closeButton.click();

                                tester.button('Написать новому клиенту').click();
                                tester.modalWindow.endTransition('transform');
                            });

                            it('Открываю выпадающий список каналов. В нем нет ни одного канала.', function() {
                                tester.select.click();

                                tester.select.
                                    popup.
                                    expectToHaveTextContent('Нет данных');
                            });
                            it('Отображены все три типа канала.', function() {
                                tester.modalWindow.button('WhatsApp').expectToBeInactive();
                                tester.modalWindow.button('WABA').expectToBeActive();
                                tester.modalWindow.button('Telegram').expectToBeActive();

                                tester.modalWindow.
                                    button('WhatsApp').
                                    expectToHaveIcon('SourceWhatsappFilled20');

                                tester.modalWindow.
                                    button('WABA').
                                    expectToHaveIcon('SourceWhatsappFilled20');

                                tester.modalWindow.
                                    button('Telegram').
                                    expectToHaveIcon('SourceTelegramFilled20');

                                tester.input.
                                    withPlaceholder('Введите номер').
                                    expectToHaveValue('');
                            });
                        });
                        it('Отображен только тип канала Telegram Private.', function() {
                            tester.modalWindow.button('Начать чат').expectToBeDisabled();

                            tester.modalWindow.button('WhatsApp').expectNotToExist();
                            tester.modalWindow.button('WABA').expectNotToExist();
                            tester.modalWindow.button('Telegram').expectToBeVisible();

                            tester.input.
                                withPlaceholder('Введите номер').
                                expectNotToHaveError();
                        });
                    });
                    describe(
                        'Номер найден в каналах Telegram Private и WhatsApp.',
                    function() {
                        beforeEach(function() {
                            searchResultsRequest.
                                addNotStartedYetWabaWhatsApp().
                                receiveResponse();
                        });

                        describe('Номер найден в каналах Telegram Private и WhatsApp.', function() {
                            beforeEach(function() {
                                chatChannelSearchRequest.
                                    addWhatsApp().
                                    receiveResponse();
                            });

                            describe('Выбираю канал.', function() {
                                beforeEach(function() {
                                    tester.modalWindow.select.click();

                                    tester.select.
                                        option('Нижний Новгород').
                                        click();
                                });

                                describe('Ввожу другой номер телефона.', function() {
                                    beforeEach(function() {
                                        tester.input.
                                            withPlaceholder('Введите номер').
                                            fill('79283810989');
                                    });

                                    describe('Выбираю канал.', function() {
                                        beforeEach(function() {
                                            tester.modalWindow.select.click();

                                            tester.select.
                                                option('Нижний Новгород').
                                                click();
                                        });

                                        it('Нажимаю на Enter в поле ввода номера.', function() {
                                            tester.input.
                                                withPlaceholder('Введите номер').
                                                pressEnter();

                                            tester.searchResultsRequest().
                                                anotherToken().
                                                thirdSearchString().
                                                newVisitor().
                                                telegramPrivate().
                                                receiveResponse();

                                            tester.chatChannelSearchRequest().
                                                anotherSearchString().
                                                telegramPrivate().
                                                receiveResponse();

                                            tester.modalWindow.
                                                select.
                                                expectToHaveTextContent('Выберите канал');

                                            tester.button('Начать чат').expectToBeDisabled();
                                        });
                                        it('Канал выбран.', function() {
                                            tester.modalWindow.
                                                select.
                                                expectToHaveTextContent('Нижний Новгород');

                                            tester.button('Начать чат').expectToBeEnabled();
                                        });
                                    });
                                    it('Канал не выбран.', function() {
                                        tester.modalWindow.
                                            select.
                                            expectToHaveTextContent('Выберите канал');

                                        tester.button('Начать чат').expectToBeDisabled();
                                    });
                                });
                                it('Нажимаю на кнопку типа WhatsApp. Канал не выбран.', function() {
                                    tester.modalWindow.button('WhatsApp').click();

                                    tester.modalWindow.
                                        select.
                                        expectToHaveTextContent('Выберите канал');

                                    tester.button('Начать чат').expectToBeDisabled();

                                });
                                it('Канал выбран.', function() {
                                    tester.modalWindow.
                                        select.
                                        expectToHaveTextContent('Нижний Новгород');

                                    tester.button('Начать чат').expectToBeEnabled();
                                });
                            });
                            it(
                                'Нажимаю на кнопку типа WhatsApp. Раскрываю список каналов. В нем отображён только ' +
                                'канал WhatsApp.',
                            function() {
                                tester.modalWindow.button('WhatsApp').click();
                                tester.modalWindow.select.click();

                                tester.select.
                                    popup.
                                    expectToHaveTextContent('Якутск');

                            });
                            it(
                                'Раскрываю список каналов. В списке отображены только каналы Telegram Private.',
                            function() {
                                tester.modalWindow.select.click();

                                tester.select.
                                    popup.
                                    expectToHaveTextContent('Нижний Новгород');
                            });
                            it('Отображенны типы каналов WhatsApp и Telegram.', function() {
                                tester.modalWindow.button('WhatsApp').expectToBeActive();
                                tester.modalWindow.button('WABA').expectNotToExist();
                                tester.modalWindow.button('Telegram').expectToBeInactive();
                            });
                        });
                        it(
                            'Номер найден только в канале Telegram Private. Отображен только тип канала Telegram ' +
                            'Private.',
                        function() {
                            chatChannelSearchRequest.receiveResponse();

                            tester.modalWindow.button('WhatsApp').expectNotToExist();
                            tester.modalWindow.button('WABA').expectNotToExist();
                            tester.modalWindow.button('Telegram').expectToBeInactive();
                        });
                    });
                    describe('Номер не найден ни в одном канале.', function() {
                        beforeEach(function() {
                            searchResultsRequest.noData().receiveResponse();
                            chatChannelSearchRequest.receiveResponse();
                        });

                        it(
                            'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку исходящего сообщения ' +
                            'новому контакту. Сообщение об ошибке не отображено.',
                        function() {
                            tester.modalWindow.closeButton.click();

                            tester.button('Написать новому клиенту').click();
                            tester.modalWindow.endTransition('transform');

                            tester.input.
                                withPlaceholder('Введите номер').
                                expectNotToHaveError();
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
                        searchResultsRequest.receiveResponse();
                        chatChannelSearchRequest.addTelegramPrivate();
                    });

                    describe('В одном из каналов нет своего чата.', function() {
                        beforeEach(function() {
                            chatChannelSearchRequest.anotherEmployee();
                        });

                        describe('Раскрываю список каналов.', function() {
                            beforeEach(function() {
                                chatChannelSearchRequest.receiveResponse();
                                tester.modalWindow.select.click();
                            });

                            it('Выбираю канал. Открыт активный чат.', function() {
                                tester.select.
                                    option('Нижний Новгород').
                                    click();

                                tester.button('Начать чат').click();

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

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.messageListRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.chatInfoRequest().receiveResponse();
                            });
                            it('Все опции каналов доступны.', function() {
                                tester.select.
                                    option('Нижний Новгород').
                                    expectToBeEnabled();

                                tester.select.
                                    option('Белгород').
                                    expectToBeEnabled();
                            });
                        });
                        it(
                            'Найден чужой закрытый чат. Выбираю канал. Нажимаю на кнопку начатия чата. Открыт чат.',
                        function() {
                            chatChannelSearchRequest.
                                closed().
                                receiveResponse();

                            tester.modalWindow.select.click();

                            tester.select.
                                option('Нижний Новгород').
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
                            tester.chatInfoRequest().receiveResponse();
                        });
                    });
                    it('Найден свой закрытый чат. Нажимаю на кнопку начатия чата. Открыт чат.', function() {
                        chatChannelSearchRequest.
                            closed().
                            receiveResponse();

                        tester.modalWindow.select.click();

                        tester.select.
                            option('Нижний Новгород').
                            click();

                        tester.button('Начать чат').click();

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

                        tester.submoduleInitilizationEvent().
                            contacts().
                            expectToBeSent();

                        tester.messageListRequest().receiveResponse();
                        tester.visitorCardRequest().receiveResponse();
                        tester.chatInfoRequest().receiveResponse();
                    });
                    it('Найден новый чат. Нажимаю на кнопку начатия чата. Ничего не происходит.', function() {
                        chatChannelSearchRequest.
                            new().
                            receiveResponse();

                        tester.modalWindow.select.click();

                        tester.select.
                            option('Нижний Новгород').
                            click();

                        tester.button('Начать чат').click();
                    });
                });
            });
            it('Открываю выпадающий список каналов. В нем нет ни одного канала.', function() {
                tester.select.click();

                tester.select.
                    popup.
                    expectToHaveTextContent('Нет данных');
            });
            it('Отображены все три типа канала.', function() {
                tester.modalWindow.button('WhatsApp').expectToBeInactive();
                tester.modalWindow.button('WABA').expectToBeActive();
                tester.modalWindow.button('Telegram').expectToBeActive();

                tester.modalWindow.
                    button('WhatsApp').
                    expectToHaveIcon('SourceWhatsappFilled20');

                tester.modalWindow.
                    button('WABA').
                    expectToHaveIcon('SourceWhatsappFilled20');

                tester.modalWindow.
                    button('Telegram').
                    expectToHaveIcon('SourceTelegramFilled20');

                tester.input.
                    withPlaceholder('Введите номер').
                    expectNotToHaveError();
            });
        });
        it('Чужие чаты недоступны. Нажимаю на кнопку исходящего сообщения новому контакту.', function() {
            accountRequest.
                operatorWorkplaceAvailable().
                receiveResponse();

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            secondAccountRequest.
                operatorWorkplaceAvailable().
                receiveResponse();

            tester.employeesWebSocket.connect();

            tester.employeesInitMessage().
                oauthToken().
                expectToBeSent();

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

            tester.button('Написать новому клиенту').click();
            tester.modalWindow.endTransition('transform');

            tester.input.
                withPlaceholder('Введите номер').
                fill('79283810988').
                pressEnter();

            tester.searchResultsRequest().
                anotherToken().
                anotherSearchString().
                newVisitor().
                telegramPrivate().
                receiveResponse();

            tester.chatChannelSearchRequest().
                telegramPrivate().
                addTelegramPrivate().
                anotherEmployee().
                receiveResponse();

            tester.modalWindow.select.click();

            tester.select.
                option('Нижний Новгород').
                expectToBeDisabled();

            tester.select.
                option('Белгород').
                expectToBeEnabled();
        });
    });
});
