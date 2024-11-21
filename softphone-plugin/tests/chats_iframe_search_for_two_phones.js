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

        it('Открываю IFrame чатов в Битрикс.', function() {
            let accountRequest,
                secondAccountRequest;

            tester = new Tester({
                application: 'bitrixChatsIframe',
                isIframe: true,
                search: '79283810988,79283810989',
                ...options,
            });

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

            accountRequest = tester.accountRequest().
                forIframe().
                fromIframe().
                webAccountLoginUnavailable().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            const searchResultsRequest = tester.searchResultsRequest().
                anotherToken().
                anotherSearchString().
                expectToBeSent(requests);

            const secondSearchResultsRequest = tester.searchResultsRequest().
                anotherToken().
                thirdSearchString().
                anotherLastMessage().
                expectToBeSent(requests);

            requests.expectToBeSent();

            accountRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeRequest.receiveResponse();
            searchResultsRequest.receiveResponse();
            secondSearchResultsRequest.receiveResponse();

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

            tester.chatListItem('Сообщение #75').expectToBeVisible();
            tester.chatListItem('Сообщение #76').expectToBeVisible();

            tester.input.expectToHaveValue('["79283810988","79283810989"]');
        });
    });
});
