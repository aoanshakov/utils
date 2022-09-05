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

    describe('Открываю раздел "Все обращения". Нажимаю на ссылку с количеством сообщений.', function() {
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
            
            const requests = ajax.inAnyOrder();

            const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                forChats().
                webAccountLoginAvailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.allRequests().receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();

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

            tester.table.row.first.column.withHeader('Сообщений').button('4').click();

            tester.messageListRequest().chat().receiveResponse();
            tester.chatListRequest().chatForReport().receiveResponse();
        });

        it('Отображена история переписки.', function() {
            tester.body.expectTextContentToHaveSubstring(
                'История переписки с Помакова Бисерка Драгановна ' +

                '10 февраля 2020 ' +

                'Здравствуйте 12:12 ' +
                'Привет 12:13'
            );
        });
    });
});
