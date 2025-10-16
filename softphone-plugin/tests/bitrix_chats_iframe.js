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

    describe('Включено расширение Chrome. Открываю IFrame чатов в Битрикс.', function() {
        let tester,
            accountRequest,
            secondAccountRequest,
            widgetSettings,
            chatListRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                application: 'bitrixChatsIframe',
                isIframe: true,
                search: '79283810988',
                ...options,
            });
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

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

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

                const chatListRequest = tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    expectToBeSent(requests);

                searchResultsRequest = tester.searchResultsRequest().
                    anotherToken().
                    anotherSearchString().
                    expectToBeSent(requests);

                const chatChannelSearchRequest = tester.chatChannelSearchRequest().
                    emptySearchString().
                    expectToBeSent(requests);

                requests.expectToBeSent();


                thirdAccountRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();
                chatListRequest.receiveResponse();
                chatChannelSearchRequest.receiveResponse();

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
