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
            searchResultsRequest,
            chatChannelListRequest;

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
                let chatListRequest;

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

                    tester.searchResultsRequest().
                        anotherToken().
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

                    tester.chatListRequest().
                        forCurrentEmployee().
                        closed().
                        noData().
                        receiveResponse();

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();

                    tester.chatChannelSearchRequest().
                        emptySearchString().
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

                            tester.searchResultsRequest().
                                anotherToken().
                                emptySearchString().
                                receiveResponse();

                            tester.chatChannelSearchRequest().
                                emptySearchString().
                                addWaba().
                                addThirdTelegramPrivate().
                                receiveResponse();
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
                                    telegramPrivate();
                            });

                            describe('Чаты не найдены.', function() {
                                beforeEach(function() {
                                    chatChannelSearchRequest.noChat();
                                });

                                describe(
                                    'Номер найден только в канале Tenegram Private. Номер найден в каналах Telegram ' +
                                    'Private и WhatsApp.',
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
                                                
                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();
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
                                        'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку исходящего ' +
                                        'сообщения новому контакту.',
                                    function() {
                                        beforeEach(function() {
                                            tester.modalWindow.closeButton.click();

                                            tester.button('Написать новому клиенту').click();
                                            tester.modalWindow.endTransition('transform');

                                            tester.searchResultsRequest().
                                                anotherToken().
                                                emptySearchString().
                                                receiveResponse();

                                            tester.chatChannelSearchRequest().
                                                emptySearchString().
                                                addWaba().
                                                addThirdTelegramPrivate().
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
                                        tester.modalWindow.button('Начать чат').expectToBeEnabled();

                                        tester.modalWindow.button('WhatsApp').expectNotToExist();
                                        tester.modalWindow.button('WABA').expectNotToExist();
                                        tester.modalWindow.button('Telegram').expectToBeVisible();

                                        tester.input.
                                            withPlaceholder('Введите номер').
                                            expectNotToHaveError();
                                    });
                                });
                                describe('Номер найден в каналах Telegram Private и WhatsApp.', function() {
                                    beforeEach(function() {
                                        searchResultsRequest.
                                            addNotStartedYetWabaWhatsApp().
                                            receiveResponse();
                                    });

                                    describe('Номер найден в каналах Telegram Private и WhatsApp.', function() {
                                        beforeEach(function() {
                                            chatChannelSearchRequest.
                                                addWhatsApp().
                                                addTelegramPrivate().
                                                receiveResponse();
                                        });

                                        describe(
                                            'Нажимаю на кнопку типа Telegram. Раскрываю список каналов.',
                                        function() {
                                            beforeEach(function() {
                                                tester.modalWindow.button('Telegram').click();
                                                tester.modalWindow.select.click();
                                            });

                                            describe('Выбираю канал.', function() {
                                                beforeEach(function() {
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
                                                                option('Белгород').
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
                                                                expectToHaveTextContent('Нижний Новгород');

                                                            tester.button('Перейти к чату').expectToBeEnabled();
                                                        });
                                                        it('Канал выбран.', function() {
                                                            tester.modalWindow.
                                                                select.
                                                                expectToHaveTextContent('Белгород');

                                                            tester.button('Начать чат').expectToBeEnabled();
                                                        });
                                                    });
                                                    it('Канал не выбран.', function() {
                                                        tester.modalWindow.
                                                            select.
                                                            expectToHaveTextContent('Выберите канал *');

                                                        tester.button('Начать чат').expectToBeDisabled();
                                                    });
                                                });
                                                it(
                                                    'Нажимаю на кнопку типа WhatsApp. Выбран канал типа WhatsApp.',
                                                function() {
                                                    tester.modalWindow.button('WhatsApp').click();

                                                    tester.modalWindow.
                                                        select.
                                                        expectToHaveTextContent('Якутск');

                                                    tester.button('Начать чат').expectToBeEnabled();

                                                });
                                                it('Канал выбран.', function() {
                                                    tester.modalWindow.
                                                        select.
                                                        expectToHaveTextContent('Нижний Новгород');

                                                    tester.button('Начать чат').expectToBeEnabled();
                                                });
                                            });
                                            it('В нем отображён только канал Telegram.', function() {
                                                tester.select.
                                                    popup.
                                                    expectToHaveTextContent(
                                                        'Нижний Новгород ' +
                                                        'Белгород'
                                                    );
                                            });
                                        });
                                        it(
                                            'Раскрываю список каналов. В списке отображены только каналы Telegram ' +
                                            'Private.',
                                        function() {
                                            tester.modalWindow.select.click();

                                            tester.select.
                                                popup.
                                                expectToHaveTextContent('Якутск');
                                        });
                                        it('Отображенны типы каналов WhatsApp и Telegram.', function() {
                                            tester.modalWindow.button('WhatsApp').expectToBeInactive();
                                            tester.modalWindow.button('WABA').expectNotToExist();
                                            tester.modalWindow.button('Telegram').expectToBeActive();
                                        });
                                    });
                                    it(
                                        'Номер найден только в канале Telegram Private. Отображен только тип канала ' +
                                        'Telegram Private.',
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
                                        'Закрываю окно начатия чата с новым клиентом. Нажимаю на кнопку исходящего ' +
                                        'сообщения новому контакту. Сообщение об ошибке не отображено.',
                                    function() {
                                        tester.modalWindow.closeButton.click();

                                        tester.button('Написать новому клиенту').click();
                                        tester.modalWindow.endTransition('transform');

                                        tester.searchResultsRequest().
                                            anotherToken().
                                            emptySearchString().
                                            receiveResponse();

                                        tester.chatChannelSearchRequest().
                                            emptySearchString().
                                            addWaba().
                                            addThirdTelegramPrivate().
                                            receiveResponse();

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

                                describe('В одном из каналов первый чат является чужим.', function() {
                                    beforeEach(function() {
                                        chatChannelSearchRequest.anotherEmployee();
                                    });

                                    describe('Чужой чат недоступен.', function() {
                                        beforeEach(function() {
                                            chatChannelSearchRequest.chatUnavailable();
                                        });

                                        describe(
                                            'Чужой чат является активным. В канале нет других чатов кроме чужого. ' +
                                            'Раскрываю список каналов.',
                                        function() {
                                            beforeEach(function() {
                                                chatChannelSearchRequest.receiveResponse();
                                                tester.modalWindow.select.click();
                                            });

                                            it(
                                                'Помещаю курсор мыши над доступной опцией. Сообщение об ошибке не ' +
                                                'отображено.',
                                            function() {
                                                tester.select.
                                                    option('Белгород').
                                                    putMouseOver();

                                                tester.select.
                                                    option('Белгород').
                                                    tooltipTrigger.
                                                    expectNotToExist();

                                                tester.waitForTooltip().expectNotToExist();
                                            });
                                            it(
                                                'Помещаю курсор мыши над заблокированной опцией. Отображено ' +
                                                'сообщение об ошибке.',
                                            function() {
                                                tester.select.
                                                    option('Нижний Новгород').
                                                    tooltipTrigger.
                                                    putMouseOver();

                                                tester.waitForTooltip().expectToHaveTextContent(
                                                    'По этому номеру уже был создан чат другим оператором'
                                                );
                                            });
                                            it('Некоторые опции каналов заблокированы.', function() {
                                                tester.select.
                                                    option('Нижний Новгород').
                                                    expectToBeDisabled();

                                                tester.select.
                                                    option('Белгород').
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
                                                option('Нижний Новгород').
                                                expectToBeDisabled();

                                            tester.select.
                                                option('Белгород').
                                                expectToBeEnabled();
                                        });
                                        it('Чужой чат является закрытым. Опция канала доступна.', function() {
                                            chatChannelSearchRequest.
                                                closed().
                                                receiveResponse();

                                            tester.modalWindow.select.click();

                                            tester.select.
                                                option('Нижний Новгород').
                                                expectToBeEnabled();

                                            tester.select.
                                                option('Белгород').
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

                                        it('Выбираю канал. Открыт активный чат.', function() {
                                            tester.select.
                                                option('Нижний Новгород').
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

                                            tester.submoduleInitilizationEvent().
                                                contacts().
                                                expectToBeSent();

                                            tester.messageListRequest().receiveResponse();
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
                                        'Найден чужой закрытый чат. Выбираю канал. Нажимаю на кнопку начатия чата. ' +
                                        'Открыт чат.',
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
                                            option('Нижний Новгород').
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

                                        tester.submoduleInitilizationEvent().
                                            contacts().
                                            expectToBeSent();

                                        tester.messageListRequest().receiveResponse();
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
                                    it(
                                        'Найден также недоступный активный чужой чат. Опция канала с чужим чатом ' +
                                        'заблокирована.',
                                    function() {
                                        chatChannelSearchRequest.
                                            addAnotherEmployeeUnavailableActiveChat().
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
                                            option('Нижний Новгород').
                                            tooltipTrigger.
                                            putMouseOver();

                                        tester.waitForTooltip().expectToHaveTextContent(
                                            'По этому номеру уже был создан чат, его можно найти во вкладке "Новые"'
                                        );
                                    });
                                    it('Канал с новым чатом заблокирован.', function() {
                                        tester.select.
                                            option('Нижний Новгород').
                                            expectToBeDisabled();

                                        tester.select.
                                            option('Белгород').
                                            expectToBeEnabled();

                                        tester.spin.expectNotToExist();
                                    });
                                });
                            });
                            it('Отображён спиннер.', function() {
                                tester.spin.expectToBeVisible();
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

                            tester.searchResultsRequest().
                                anotherToken().
                                sixthSearchString().
                                newVisitor().
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
                                                'misc-chats-src-components-chats-channel-search-start-channel-select-' +
                                                'styles-module__selected'
                                            );

                                        tester.select.
                                            option('Белгород 79283810988').
                                            expectNotToHaveClass(
                                                'misc-chats-src-components-chats-channel-search-start-channel-select-' +
                                                'styles-module__selected'
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
                                            'misc-contacts-src-components-contact-bar-start-channel-select-styles-' +
                                            'module__selected'
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
                                    'Помещаю курсор над заблокированной опцией. Отображена подсказка с сообщением об ' +
                                    'ошибке.',
                                function() {
                                    tester.select.
                                        option('Нижний Новгород 79283810988').
                                        tooltipTrigger.
                                        putMouseOver();

                                    tester.waitForTooltip().
                                        expectToHaveTextContent('По этому номеру уже был создан чат другим оператором');
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
                        it('Найден только один канал Telegram.', function() {
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
                            tester.chatInfoRequest().receiveResponse();

                            tester.button('Отменить').expectNotToExist();

                            tester.contactBar.expectTextContentToHaveSubstring(
                                'ФИО ' +
                                'Помакова Бисерка Драгановна'
                            );
                        });
                    });
                });
                describe(
                    'Один из чатов имеет канал типа WhatsApp. Открываю чат. Нажимаю на опцию канала. Найдены каналы ' +
                    'типов Waba и WhatsApp.',
                function() {
                    let searchResultsRequest,
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

                        searchResultsRequest = tester.searchResultsRequest().
                            anotherToken().
                            sixthSearchString().
                            newVisitor().
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
                            searchResultsRequest.whatsApp();
                        });

                        describe('Не найден чат Waba.', function() {
                            beforeEach(function() {
                                searchResultsRequest.receiveResponse();
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
                            searchResultsRequest.
                                addNotStartedYetWaba().
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
                    it('Не найден ни чат WhatsApp ни чат Waba. Отображено сообщение об отсутвии каналов.', function() {
                        searchResultsRequest.receiveResponse();
                        chatChannelSearchRequest.receiveResponse();

                        tester.notificationWindow.expectToHaveTextContent('Нет активных каналов');
                    });
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

                tester.searchResultsRequest().
                    anotherToken().
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

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    receiveResponse();

                tester.button('Написать новому клиенту').click();
                tester.modalWindow.endTransition('transform');

                tester.searchResultsRequest().
                    anotherToken().
                    emptySearchString().
                    receiveResponse();

                tester.chatChannelSearchRequest().
                    emptySearchString().
                    addWaba().
                    addThirdTelegramPrivate().
                    receiveResponse();

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
        it('Активен только канал WhatsApp. Отображен только канал WhatsApp.', function() {
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

            tester.searchResultsRequest().
                anotherToken().
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

            tester.chatChannelSearchRequest().
                emptySearchString().
                receiveResponse();

            tester.button('Написать новому клиенту').click();
            tester.modalWindow.endTransition('transform');

            tester.searchResultsRequest().
                anotherToken().
                emptySearchString().
                receiveResponse();

            tester.chatChannelSearchRequest().
                emptySearchString().
                receiveResponse();

            tester.modalWindow.button('WhatsApp').expectToBeInactive();
            tester.modalWindow.button('WABA').expectNotToExist();
            tester.modalWindow.button('Telegram').expectNotToExist();
        });
    });
});
