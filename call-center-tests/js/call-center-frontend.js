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
                spendTime: spendTime
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

        it('', function() {
        });
    });
});
