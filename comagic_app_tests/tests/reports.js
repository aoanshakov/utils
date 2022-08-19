tests.addTest(options => {
    const {
        utils,
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
        setDocumentVisible
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            statusesRequest,
            chatListRequest,
            countersRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();

            accountRequest = tester.accountRequest().
                webAccountLoginAvailable().
                contactsFeatureFlagDisabled().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent();

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            accountRequest.receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.accountRequest().
                forChats().
                webAccountLoginAvailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse(),
            tester.reportTypesRequest().receiveResponse();

            /*
            tester.chatChannelListRequest().receiveResponse();
            tester.statusListRequest().receiveResponse();
            tester.listRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.messageTemplateListRequest().receiveResponse();

            tester.accountRequest().
                forChats().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();

            tester.accountRequest().
                forChats().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();
            
            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            tester.countersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();
            tester.chatChannelTypeListRequest().receiveResponse();
            tester.offlineMessageListRequest().receiveResponse();
            tester.chatListRequest().receiveResponse();
            tester.chatListRequest().active().receiveResponse();
            tester.chatListRequest().closed().receiveResponse();
            */
        });

        it('Открываю раздел "Все обращения". Нажимаю на ссылку с количеством сообщений.', function() {
            tester.button('Сырые данные').click();

            spendTime(0);
            spendTime(0);
            spendTime(0);

            return;
            tester.button('Все обращения').click();
                
            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.reportStateRequest().allRequests().receiveResponse();
            tester.reportRapidFiltersRequest().communications().receiveResponse();
            tester.reportFiltersRequest().receiveResponse();
            tester.columnsTreeRequest().receiveResponse();
            tester.tagsRequest().receiveResponse();
            tester.customFiltersRequest().receiveResponse();
            tester.communicationsRequest().receiveResponse()

            tester.table.row.first().column.withHeader('Сообщений').button('4').click();

            tester.configRequest().receiveResponse();
            tester.messageListRequest().chat().receiveResponse();
            tester.chatListRequest().chat().receiveResponse();
        });
    });
});

/*

describe('Аналитика доступна.', function() {
    beforeEach(function() {
        accountRequest.webAccountLoginAvailable().receiveResponse();

        tester.reportGroupsRequest().receiveResponse();
        tester.reportsListRequest().allRequests().receiveResponse();
        tester.reportTypesRequest().receiveResponse();

        tester.configRequest().receiveResponse();
        tester.operatorAccountRequest().receiveResponse();
    });

    describe('Открываю раздел "Все обращения". Нажимаю на ссылку с количеством сообщений.', function() {
        beforeEach(function() {
            tester.button('Сырые данные').click();
            tester.button('Все обращения').click();
                
            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportsListRequest().allRequests().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.reportStateRequest().allRequests().receiveResponse();
            tester.reportRapidFiltersRequest().communications().receiveResponse();
            tester.reportFiltersRequest().receiveResponse();
            tester.columnsTreeRequest().receiveResponse();
            tester.tagsRequest().receiveResponse();
            tester.customFiltersRequest().receiveResponse();
            tester.communicationsRequest().receiveResponse()

            tester.table.row.first().column.withHeader('Сообщений').button('4').click();

            tester.configRequest().receiveResponse();
            tester.messageListRequest().chat().receiveResponse();
            tester.chatListRequest().chat().receiveResponse();
        });

        describe(
            'Нажимаю на ссылку с количеством сообщений в другой строке.',
        function() {
            let chatListRequest;

            beforeEach(function() {
                tester.antDrawerCloseButton.click();

                tester.table.row.atIndex(1).column.withHeader('Сообщений').button('5').click();

                tester.configRequest().receiveResponse();
                tester.messageListRequest().anotherChat().receiveResponse();
                chatListRequest = tester.chatListRequest().anotherChat().expectToBeSent();
            });

            it('Чат не найден. Отображены другие сообщения.', function() {
                chatListRequest.nothingFound().receiveResponse();
                tester.body.expectTextContentToHaveSubstring('Здравствуй 12:13');
            });
            it('Отображены другие сообщения.', function() {
                chatListRequest.receiveResponse();
                tester.body.expectTextContentToHaveSubstring('Здравствуй 12:13');
            });
        });
        it('Отображены сообщения.', function() {
            tester.body.expectTextContentToHaveSubstring('Привет 12:13');
        });
    });
    it('Открываю РМО.', function() {
        tester.productsButton.click();
        tester.button('Рабочее место оператора').click();
            
        tester.configRequest().receiveResponse();
        tester.configRequest().receiveResponse();
        tester.operatorOfflineMessageListRequest().receiveResponse();
        tester.chatListRequest().receiveResponse();
        tester.chatChannelListRequest().receiveResponse();
        tester.operatorStatusListRequest().receiveResponse();
        tester.operatorListRequest().receiveResponse();
        tester.operatorSiteListRequest().receiveResponse();

        tester.chatsWebSocket.connect();
        tester.chatsInitMessage().expectToBeSent();
        tester.operatorAccountRequest().receiveResponse();
        tester.messageListRequest().receiveResponse();
        tester.messageListRequest().receiveResponse();
    });
});

*/
