tests.addTest(options => {
    const {
        Tester,
        ajax,
        notificationTester,
    } = options;

    describe('Я уже аутентифицирован. Открываю новый личный кабинет.', function() {
        let authenticatedUserRequest,
            ticketsContactsRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true
            });

            tester.accountRequest().receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);
            const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().additional().expectToBeSent();
            tester.slavesNotification().expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

            notificationTester.grantPermission();
            tester.connectEventsWebSocket();

            tester.slavesNotification().
                twoChannels().
                enabled().
                softphoneServerConnected().
                expectToBeSent();

            tester.connectSIPWebSocket();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                expectToBeSent();

            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
            tester.registrationRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                registered().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                registered().
                microphoneAccessGranted().
                expectToBeSent();

            authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.button('Софтфон').click();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();
        });
    });
});
