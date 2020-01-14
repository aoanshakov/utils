tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        AmocrmWidgetTester = options.AmocrmWidgetTester,
        spendTime = options.spendTime;

    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Появляется виджет amoCRM.', function() {
        var tester;

        beforeEach(function() {
            tester = new AmocrmWidgetTester(options);
            Promise.runAll();
            tester.requestAuthorization().send();
            tester.requestAuthCheck().send();
            tester.requestSettings().send();
            tester.allowMediaInput();
            tester.connectWebSockets();
            tester.requestRegistration().send();
        });

        describe('Нажимаю на иконку с трубкой.', function() {
            beforeEach(function() {
                tester.clickPhoneIcon();
            });

            describe('Ввожу номер телефона.', function() {
                var outboundCall;

                beforeEach(function() {
                    tester.phoneField.input('79161234567');
                });

                describe('Совершаю исходящий звонок.', function() {
                    beforeEach(function() {
                        tester.callButton.click();
                        tester.firstConnection.connectWebRTC();
                        tester.allowMediaInput();
                        tester.requestNameByNumber().send();
                        outboundCall = tester.outboundCall();
                    });

                    describe('Сервер оповестил о начале процесса дозвона.', function() {
                        beforeEach(function() {
                            outboundCall.setRinging();
                        });

                        describe('Вызываемый сотрудник поднял трубку.', function() {
                            beforeEach(function() {
                                outboundCall.setAccepted();
                            });
                            
                            it(
                                'Завершаю исходящий звонок. Никакие звуки не слышны. Имя вызываемого сотрудника не ' +
                                'отображается.',
                            function() {
                                tester.stopButton.click();
                                tester.requestCallFinish();

                                tester.expectNoSoundToPlay();
                                tester.nameContainer.expectNotToExist();
                            });
                            it(
                                'Отображается имя вызываемого сотрудника. Звучит голос вызываемого сотрудника.',
                            function() {
                                tester.nameContainer.expectToHaveTextContent('Шалева Дора');
                                tester.firstConnection.expectRemoteStreamToPlay();
                            });
                        });
                        it(
                            'Отменяю исходящий звонок. Имя вызываемого сотрудника не отображается. Слышен сигнал ' +
                            '"Занято".',
                        function() {
                            tester.stopButton.click();
                            tester.requestCancelOutgoingCall();

                            tester.expectBusyCallSoundToPlay();
                            tester.nameContainer.expectNotToExist();
                        });
                        it('Звучит сигнал исходящего звонка.', function() {
                            tester.expectOutgoingCallSoundToPlay();
                        });
                    });
                    it(
                        'Отображается имя вызываемого сотрудника и слово "вызов". Никакие звуки не слышны. Кнопка ' +
                        'остановки звонка доступна.',
                    function() {
                        tester.nameContainer.expectToHaveTextContent('Шалева Дора');
                        tester.expectNoSoundToPlay();
                    });
                });
                it('Кнопка старта звонка доступна.', function() {
                    tester.callButton.expectNotToHaveClass('cmg-button-disabled');
                    tester.stopButton.expectToHaveClass('cmg-button-disabled');
                });
            });
            describe('Поступил входящий звонок.', function() {
                beforeEach(function() {
                    tester.incomingCall().receive();
                    Promise.runAll();
                    tester.requestNameByNumber().send();
                });

                describe('Получены данные позвонившего абонента.', function() {
                    beforeEach(function() {
                        tester.incomingCallProceeding().receive();
                        spendTime(1000);
                    });

                    describe('Принимаю звонок.', function() {
                        beforeEach(function() {
                            tester.callButton.click();
                            tester.firstConnection.connectWebRTC();
                            tester.allowMediaInput();
                            tester.firstConnection.addCandidate();
                            tester.requestAcceptIncomingCall();
                        });

                        it(
                            'Завершаю звонок. Ни один звук не звучит. Имя позвонившего абонента не отображается.',
                        function() {
                            tester.stopButton.click();
                            tester.requestCallFinish();

                            tester.expectNoSoundToPlay();
                            tester.nameContainer.expectNotToExist();
                        });
                        it(
                            'Звучит голос позвонившего абонента. Отображается имя позвонившего абонента. Кнопка ' +
                            'остановки звонка доступна.',
                        function() {
                            tester.firstConnection.expectRemoteStreamToPlay();
                            tester.nameContainer.expectToHaveTextContent('Шалева Дора');
                            tester.callButton.expectToHaveClass('cmg-button-disabled');
                            tester.stopButton.expectNotToHaveClass('cmg-button-disabled');
                        });
                    });
                    it(
                        'Отклоняю звонок. Ни один звук не звучит. Имя позвонившего абонента не отображается.',
                    function() {
                        tester.stopButton.click();
                        tester.requestDeclineIncomingCall();

                        tester.expectNoSoundToPlay();
                        tester.nameContainer.expectNotToExist();
                    });
                });
                it(
                    'Отображено имя позвонившего абонента. Звучит сигнал входящего звонка. Кнопки остановки звонка и ' +
                    'старта звонка доступны.',
                function() {
                    tester.nameContainer.expectTextContentToHaveSubstring('Шалева Дора');
                    tester.expectIncomingCallSoundToPlay();
                    tester.callButton.expectNotToHaveClass('cmg-button-disabled');
                    tester.stopButton.expectNotToHaveClass('cmg-button-disabled');
                });
            });
            it('Выбрана первая SIP-линия. Кнопка старта и остановки звонка заблокированы.', function() {
                tester.firstLineButton.expectToHaveClass('cmg-sip-line-button-selected');
                tester.secondLineButton.expectNotToHaveClass('cmg-sip-line-button-selected');
                tester.callButton.expectToHaveClass('cmg-button-disabled');
                tester.stopButton.expectToHaveClass('cmg-button-disabled');
            });
        });
    });
});
