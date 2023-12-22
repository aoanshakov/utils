tests.addTest(options => {
    const {
        Tester,
        ajax,
        notificationTester,
        spendTime,
    } = options;

    it('', function() {
        tester = new Tester({
            application: 'popup',
            ...options,
        });
    });
    return;
    describe('Я уже аутентифицирован. Открываю новый личный кабинет.', function() {
        let authenticatedUserRequest,
            ticketsContactsRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true
            });

            tester.input.fill('XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0');
            tester.button('Войти').click();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().additional().expectToBeSent();
            tester.slavesNotification().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
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

        it('', function() {
        });
    });
});
