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
        utils,
        webSockets,
        audioDecodingTester,
        unload,
    } = options;

    describe('Открываю страницу тестирования softphone-core. Ввожу WebRTC токен.', function() {
        let tester,
            authCheckRequest,
            incomingCall,
            outgoingCall;

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            if (!tester) {
                return;
            }

            tester.restoreSalesbotIFrameContentWindow();
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

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                application: 'sandbox',
                isIframe: true,
                softphoneHost: 'my.uiscom.ru',
                ...options,
            });

            tester.input.fill(tester.oauthToken);
            tester.button('OK').click();

            tester.masterInfoMessage().receive();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.authTokenRequest().receiveResponse();
            authCheckRequest = tester.authCheckRequest().expectToBeSent();
        });

        describe('Авторизация завершена.', function() {
            beforeEach(function() {
                authCheckRequest.receiveResponse();

                tester.statusesRequest().receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();

                tester.slavesNotification().
                    oneChannel().
                    enabled().
                    expectToBeSent();

                notificationTester.grantPermission();
                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    oneChannel().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.connectSIPWebSocket();

                tester.slavesNotification().
                    oneChannel().
                    softphoneServerConnected().
                    webRTCServerConnected().
                    expectToBeSent();

                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                tester.registrationRequest().
                    uisWebrtc().
                    receiveResponse();

                tester.slavesNotification().
                    oneChannel().
                    softphoneServerConnected().
                    webRTCServerConnected().
                    registered().
                    expectToBeSent();

                authenticatedUserRequest.receiveResponse();

                tester.employeeFetchedMessage().expectToBeSent();
                tester.allowMediaInput();

                tester.slavesNotification().
                    oneChannel().
                    available().
                    expectToBeSent();
            });

            describe('Ввожу номер телефона. Нажимаю кнпоку "Позвонить".', function() {
                beforeEach(function() {
                    tester.input.fill('79161234567');
                    tester.button('Позвонить').click();

                    tester.firstConnection.connectWebRTC();
                    tester.allowMediaInput();

                    outgoingCall = tester.outgoingCall().expectToBeSent();

                    tester.slavesNotification().
                        oneChannel().
                        available().
                        sending().
                        expectToBeSent();
                });

                describe('Звонок принят.', function() {
                    beforeEach(function() {
                        outgoingCall.receiveRinging();

                        tester.slavesNotification().
                            oneChannel().
                            available().
                            progress().
                            expectToBeSent();

                        outgoingCall.receiveAccepted();

                        tester.slavesNotification().
                            oneChannel().
                            available().
                            confirmed().
                            microphoneEnabled().
                            expectToBeSent();
                    });
                    
                    it('Нажимаю на кнпоку завершения звонка. Звонок завершён.', function() {
                        tester.button('Завершить звонок').click();
                        outgoingCall.expectByeToBeSent();

                        tester.slavesNotification().
                            oneChannel().
                            available().
                            ended().
                            expectToBeSent();
                    });
                    it('Отображено сообщение о том, что звонок принят.', function() {
                        tester.body.expectToHaveTextContent(
                            'Исходящий звонок на номер 79161234567 был принят ' +

                            'Завершить звонок ' +
                            'Скачать лог'
                        );
                    });
                });
                it('Отображено сообщение о том, что производится дозвон.', function() {
                    tester.body.expectToHaveTextContent(
                        'Производится дозвон на номер 79161234567 ' +

                        'Завершить звонок ' +
                        'Скачать лог'
                    );
                });
            });
            describe('Поступил входящий звонок.', function() {
                beforeEach(function() {
                    incomingCall = tester.incomingCall().receive();

                    tester.slavesNotification().
                        oneChannel().
                        available().
                        incoming().
                        progress().
                        expectToBeSent();
                });

                it('Нажимаю на кнопку принятия звонка.', function() {
                    tester.button('Принять звонок').click();

                    tester.firstConnection.connectWebRTC();
                    tester.firstConnection.callTrackHandler();

                    mediaStream = tester.allowMediaInput();
                    tester.firstConnection.addCandidate();

                    incomingCall.expectOkToBeSent().receiveResponse();

                    tester.slavesNotification().
                        oneChannel().
                        available().
                        incoming().
                        confirmed().
                        microphoneEnabled().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Входящй звонок с номера 79161234567 был принят ' +

                        'Завершить звонок ' +
                        'Скачать лог'
                    );
                });
                it('Отображено сообщение о том, что поступил входящий звонок.', function() {
                    tester.body.expectToHaveTextContent(
                        'Поступил входящй звонок с номера 79161234567 ' +

                        'Принять звонок ' +
                        'Завершить звонок ' +
                        'Скачать лог'
                    );
                });
            });
        });
        it('Не удалось авторизоваться.', function() {
            authCheckRequest.
                serverError().
                receiveResponse();

            tester.slavesNotification().
                authorzationFailed().
                expectToBeSent();

            tester.masterInfoMessage().
                leaderDeath().
                expectToBeSent();

            tester.authLogoutRequest().receiveResponse();

            tester.body.expectToHaveTextContent(
                'Произошла ошибка: Ошибка аутентификации ' +
                'Скачать лог'
            );

            tester.button('Скачать лог').click();

            tester.anchor.
                withFileName('20191219.121006.000.log.txt').
                expectHrefToBeBlobWithSubstring('Internval server error');
        });
        it('Отображено сообщение о том, что происходит авторизаци.', function() {
            tester.body.expectToHaveTextContent(
                'Происохдит авторизация... ' +
                'Скачать лог'
            );
        });
    });
});
