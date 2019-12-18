tests.addTest(function (
    ajax, testersFactory, wait, spendTime, utils, windowOpener, webSockets, webSocketLogger, userMedia,
    rtcConnectionsMock, navigatorMock, timeoutLogger, Sip, CallCenterTester
) {
    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Авторизуюсь в софтфоне.', function() {
        var tester;

        beforeEach(function() {
            tester = new CallCenterTester({
                testersFactory: testersFactory,
                utils: utils,
                ajax: ajax,
                Sip: Sip,
                webSockets: webSockets,
                spendTime: spendTime,
                rtcConnectionsMock: rtcConnectionsMock,
                userMedia: userMedia
            });

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

            xit('Набранный номер телефона отображается в поле для ввода номера телефона.', function() {
                tester.phoneField.expectToHaveValue('79161234567');
            });
            it('Нажимаю на кнопку вызова.', function() {
                tester.startCallButton.click();
                tester.connectWebRTC();
                tester.allowMediaInput();
                tester.allowMediaInput();
                tester.requestNameByNumber().send();
            });
        });
    });
});
