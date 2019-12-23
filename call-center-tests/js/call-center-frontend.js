tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        CallCenterTester = options.CallCenterTester;

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

            it(
                'Набранный номер телефона отображается в поле для ввода номера телефона. Кнопка внизу имеет зеленый ' +
                'цвет.',
            function() {
                tester.phoneField.expectToHaveValue('79161234567');
                tester.callButton.expectToHaveStyle('background-color', '#66b91d');
            });
            describe('Нажимаю на кнопку внизу.', function() {
                var outboundCall;

                beforeEach(function() {
                    tester.callButton.click();
                    tester.connectWebRTC();
                    tester.allowMediaInput();
                    tester.requestNameByNumber().send();
                    outboundCall = tester.outboundCall();
                });

                it(
                    'Отображается имя вызываемого сотрудника и слово "вызов". Никакие звуки не слышны. Кнопка внизу ' +
                    'имеет красный цвет.',
                function() {
                    tester.dialpadHeader.expectToHaveTextContent('Шалева Дора вызов');
                    tester.expectNoSoundToPlay();
                    tester.callButton.expectToHaveStyle('background-color', '#d20e0e');
                });
                describe('Сервер оповестил о начале процесса дозвона.', function() {
                    beforeEach(function() {
                        outboundCall.setRinging();
                    });

                    it('Звучит сигнал исходящего звонка.', function() {
                        tester.expectOutgoingCallSoundToPlay();
                    });
                    describe('Вызываемый сотрудник поднял трубку.', function() {
                        beforeEach(function() {
                            outboundCall.setAccepted();
                        });
                        
                        it(
                            'Отображается имя вызываемого сотрудника и длительность звонка. Звучит голос вызываемого ' +
                            'сотрудника.',
                        function() {
                            tester.dialpadHeader.expectToHaveTextContent('Шалева Дора 00:00:00');
                            tester.expectRemoteStreamToPlay();
                        });
                        it('Нажимаю на кнопку снизу. Содениение разорвано. Никакие звуки не слышны.', function() {
                            tester.callButton.click();
                            tester.requestOutgoningCallFinish();
                            tester.expectNoSoundToPlay();
                        });
                    });
                });
            });
        });
    });
});
