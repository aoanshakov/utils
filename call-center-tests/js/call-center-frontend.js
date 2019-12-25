tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        CallCenterTester = options.CallCenterTester,
        spendTime = options.spendTime;

    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Авторизуюсь в софтфоне.', function() {
        var tester;

        beforeEach(function() {
            tester = new CallCenterTester(options);

            tester.loginField.fill('ganeva@gmail.com');
            tester.passwordField.fill('83JfoekKs28Fx');
            tester.rememberMeCheckbox.click();

            tester.enterButton.click();
            Promise.runAll();
            tester.requestAuthorization().send();
            tester.requestCalls().send();
            tester.requestAuthCheck().send();
            tester.requestMarks().send();
            tester.requestSettings().send();
            tester.allowMediaInput();
            tester.requestMe().send();
            tester.requestUsers().send();
            tester.requestTalkOptions().send();
            tester.requestPermissions().send();
            tester.requestFinishReasons().send();
            tester.requestGroups().send();
            tester.connectWebSockets();
            tester.requestRegistration().send();
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

                describe('Нажимаю на кнопку принятия звонка.', function() {
                    beforeEach(function() {
                        tester.acceptIncomingCallButton.click();
                        tester.firstConnection.connectWebRTC();
                        tester.allowMediaInput();
                        tester.requestContactCalls().send();
                        tester.requestMarks().send();
                        tester.firstConnection.addCandidate();
                        tester.requestAcceptIncomingCall();
                    });

                    describe('Поступил второй входящий звонок.', function() {
                        var incomingCall;

                        beforeEach(function() {
                            incomingCall = tester.incomingCall().setAnotherNumber().receive();
                            Promise.runAll();
                            tester.requestNameByNumber().setAnotherNumber().send();
                            tester.incomingCallProceeding().setAnotherNumber().receive();
                        });

                        describe('Нажимаю на кнопку второй линии.', function() {
                            beforeEach(function() {
                                tester.secondLineButton.click();
                            });

                            describe('Сигнал удержания декодирован.', function() {
                                beforeEach(function() {
                                    Promise.runAll();
                                    spendTime(1000);
                                });

                                describe('Нажимаю на кнопку принятия вызова.', function() {
                                    beforeEach(function() {
                                        tester.acceptIncomingCallButton.click();
                                        tester.secondConnection.connectWebRTC();
                                        tester.allowMediaInput();
                                        tester.secondConnection.addCandidate();
                                        tester.requestAcceptIncomingCall();
                                    });

                                    it(
                                        'Нажимаю на кнопку снизу. Отображается имя вызываемого сотрудника и ' +
                                        'длительность звонка. Кнопка второй линии не мигает. Нажата кнопка первой ' +
                                        'линии. Звучит голос первого позвонившего абонента.',
                                    function() {
                                        tester.callButton.click();
                                        tester.requestCallFinish();

                                        spendTime(1000);
                                        Promise.runAll();
                                        tester.requestContactCalls().setAnotherNumber().send();
                                        tester.requestMarks().send();

                                        tester.firstConnection.expectRemoteStreamToPlay();
                                        tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                                        tester.firstLineButton.expectToHaveClass('clct-radio-button--selected');
                                        tester.secondLineButton.expectNotToHaveClass('clct-radio-button--selected');
                                        tester.secondLineButton.expectNotToHaveClass('clct-sip-line--incoming-call');
                                    });
                                    it(
                                        'Отображено имя второго позвонившего абонента и время разговора. Звучит ' +
                                        'голос позвонившего на вторую линию абонента.',
                                    function() {
                                        tester.dialpadHeader.expectToHaveTextContent('Гигова Петранка 00:00:00');
                                        tester.secondConnection.expectRemoteStreamToPlay();
                                    });
                                });
                                it(
                                    'Нажимаю на кнопку отклонения звонка. Отображается имя первого повзонившего ' +
                                    'абонента и длительность звонка.',
                                function() {
                                    tester.declineIncomingCallButton.click();
                                    tester.requestDeclineIncomingCall();

                                    spendTime(1000);
                                    Promise.runAll();
                                    tester.requestContactCalls().send();
                                    tester.requestMarks().send();

                                    tester.firstConnection.expectRemoteStreamToPlay();
                                    tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                                });
                                it(
                                    'Второй позвонивший абонент отменил звонок. Отображается имя первого ' +
                                    'повзонившего абонента и длительность звонка. Звучит глолс первого позвонившего ' +
                                    'абонента.',
                                function() {
                                    incomingCall.cancel();
                                    spendTime(1000);

                                    tester.firstConnection.expectRemoteStreamToPlay();
                                    tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                                });
                                it(
                                    'Нажата кнопка второй линии. Отображны данные второго позвонившего абонента. ' +
                                    'Никакие звуки не слышны.',
                                function() {
                                    tester.firstLineButton.expectNotToHaveClass('clct-radio-button--selected');
                                    tester.secondLineButton.expectToHaveClass('clct-radio-button--selected');
                                    tester.expectNoSoundToPlay();
                                });
                            });
                            it(
                                'Второй позвонивший абонент отменил звонок. Сигнал удержания декодирован. ' +
                                'Отображается имя первого повзонившего абонента и длительность звонка.',
                            function() {
                                incomingCall.cancel();

                                Promise.runAll();
                                spendTime(1000);

                                tester.firstConnection.expectRemoteStreamToPlay();
                                tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                            });
                        });
                        it(
                            'Кнопка второй линии мигает. Звучит голос позвонившего на первую линию абонента.',
                        function() {
                            tester.secondLineButton.expectToHaveClass('clct-sip-line--incoming-call');
                            tester.firstConnection.expectRemoteStreamToPlay();
                        });
                    });
                    it('Нажимаю на кнопку снизу. Кнопка внизу имеет зеленый цвет.', function() {
                        tester.callButton.click();
                        tester.requestCallFinish();

                        spendTime(1000);
                        Promise.runAll();
                        tester.requestContactCalls().send();
                        tester.requestMarks().send();

                        tester.callButton.expectToHaveStyle('background-color', '#66b91d');
                    });
                    it(
                        'Звучит голос позвонившего сотрудника. Отображается имя вызываемого сотрудника и ' +
                        'длительность звонка. Кнопка второй линии не мигает. Нажата кнопка первой линии.',
                    function() {
                        tester.firstConnection.expectRemoteStreamToPlay();
                        tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                        tester.firstLineButton.expectToHaveClass('clct-radio-button--selected');
                        tester.secondLineButton.expectNotToHaveClass('clct-radio-button--selected');
                        tester.secondLineButton.expectNotToHaveClass('clct-sip-line--incoming-call');
                    });
                });
                it('Нажимаю на кнопку отклонения звонка. Кнопка внизу имеет зеленый цвет.', function() {
                    tester.declineIncomingCallButton.click();
                    tester.requestDeclineIncomingCall();
                    tester.callButton.expectToHaveStyle('background-color', '#66b91d');
                });
                it('Данные отображены.', function() {
                    tester.callNotification.expectTextContentToHaveSubstring(
                        'Шалева Дора Добриновна ' +
                        'ООО "Некая Организация" ' +
                        '+7 (916) 123-45-67 ' +

                        'somesite.com ' +
                        '+7 (916) 123-45-68 ' +
                        'Какой-то поисковый запрос ' +
                        'Некая рекламная кампания'
                    );
                });
            });
            it('Отображено имя позвонившего абонента. Звучит сигнал входящего звонка.', function() {
                tester.callNotification.expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67');
                tester.expectIncomingCallSoundToPlay();
            });
        });
        describe('Набираю номер телефона, используя кнопки.', function() {
            beforeEach(function() {
                tester.dialpadButton(7).click();
                tester.dialpadButton(9).click();
                tester.dialpadButton(1).click();
                tester.dialpadButton(6).click();
                tester.dialpadButton(1).click();
                tester.dialpadButton(2).click();
                tester.dialpadButton(3).click();
                tester.dialpadButton(4).click();
                tester.dialpadButton(5).click();
                tester.dialpadButton(6).click();
                tester.dialpadButton(7).click();
            });

            describe('Нажимаю на кнопку внизу.', function() {
                var outboundCall;

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

                    describe('Поступил входящий звонок.', function() {
                        var incomingCall;

                        beforeEach(function() {
                            incomingCall = tester.incomingCall().setAnotherNumber().receive();
                            Promise.runAll();
                            tester.requestNameByNumber().setAnotherNumber().send();
                            tester.incomingCallProceeding().setAnotherNumber().receive();
                        });

                        describe('Нажимаю на кнопку второй линии. Нажимаю на кнопку принятия вызова.', function() {
                            beforeEach(function() {
                                tester.secondLineButton.click();

                                tester.acceptIncomingCallButton.click();
                                tester.secondConnection.connectWebRTC();
                                tester.allowMediaInput();
                                tester.secondConnection.addCandidate();
                                tester.requestAcceptIncomingCall();
                                tester.requestContactCalls().setAnotherNumber().send();
                                tester.requestMarks().send();
                            });

                            describe('Вызываемый сотрудник поднял трубку.', function() {
                                beforeEach(function() {
                                    outboundCall.setAccepted();
                                    spendTime(1000);
                                });

                                it(
                                    'Нажимаю на кнопку снизу. Отображается имя вызываемого сотрудника и длительность ' +
                                    'звонка. Звучит голос вызываемого сотрудника.',
                                function() {
                                    tester.callButton.click();
                                    tester.requestCallFinish();

                                    tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                                    tester.firstConnection.expectRemoteStreamToPlay();
                                });
                                it('Звучит голос позвонившего абонента.', function() {
                                    tester.secondConnection.expectRemoteStreamToPlay();
                                });
                            });
                            it(
                                'Отображено имя позвонившего абонента и время разговора. Звучит голос позвонившего ' +
                                'абонента и сигнал исходящего звонка.',
                            function() {
                                tester.dialpadHeader.expectToHaveTextContent('Гигова Петранка 00:00:00');
                                tester.expectOutgoingCallSoundAndRemoteStreamToPlay();
                            });
                        });
                        it('Кнопка второй линии мигает. Звучат сигналы входящего и исходящего звонка.', function() {
                            tester.secondLineButton.expectToHaveClass('clct-sip-line--incoming-call');
                            tester.expectOutgoingAndIncomingCallSoundsToPlay();
                        });
                    });
                    describe('Вызываемый сотрудник поднял трубку.', function() {
                        beforeEach(function() {
                            outboundCall.setAccepted();
                        });
                        
                        it(
                            'Нажимаю на кнопку снизу. Никакие звуки не слышны. Кнопка внизу имеет зеленый цвет. Имя ' +
                            'вызываемого сотрудника не отображается.',
                        function() {
                            tester.callButton.click();
                            tester.requestCallFinish();

                            tester.expectNoSoundToPlay();
                            tester.dialpadHeader.expectToHaveTextContent('');
                            tester.callButton.expectToHaveStyle('background-color', '#66b91d');
                        });
                        it(
                            'Отображается имя вызываемого сотрудника и длительность звонка. Звучит голос вызываемого ' +
                            'сотрудника.',
                        function() {
                            tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                            tester.firstConnection.expectRemoteStreamToPlay();
                        });
                    });
                    it(
                        'Нажимаю на кнопку снизу. Кнопка внизу имеет зеленый цвет. Имя ' +
                        'вызываемого сотрудника не отображается. Слышен сигнал "Занято".',
                    function() {
                        tester.callButton.click();
                        tester.requestCancelOutgoingCall();

                        tester.expectBusyCallSoundToPlay();
                        tester.dialpadHeader.expectToHaveTextContent('');
                        tester.callButton.expectToHaveStyle('background-color', '#66b91d');
                    });
                    it('Звучит сигнал исходящего звонка.', function() {
                        tester.expectOutgoingCallSoundToPlay();
                    });
                });
                it(
                    'Отображается имя вызываемого сотрудника и слово "вызов". Никакие звуки не слышны. Кнопка внизу ' +
                    'имеет красный цвет.',
                function() {
                    tester.dialpadHeader.expectToHaveTextContent('Шалева Дора вызов');
                    tester.expectNoSoundToPlay();
                    tester.callButton.expectToHaveStyle('background-color', '#d20e0e');
                });
            });
            it(
                'Набранный номер телефона отображается в поле для ввода номера телефона. Кнопка внизу имеет зеленый ' +
                'цвет.',
            function() {
                tester.phoneField.expectToHaveValue('79161234567');
                tester.callButton.expectToHaveStyle('background-color', '#66b91d');
            });
        });
    });
});
