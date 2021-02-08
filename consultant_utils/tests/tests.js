tests.addTest(function (options) {
    const {ConsultantTester, spendTime, ajax, notificationTester} = options;

    describe('Аутентифицируюсь.', function() {
        let tester;

        beforeEach(function() {
            ajax.expectSomeRequestsToBeSent();

            tester = new ConsultantTester(options);
            tester.path.open('/');

            tester.textfield().withPlaceholder('Логин').fill('t.daskalova');
            tester.textfield().withPlaceholder('Пароль').fill('2G892H4gsGjk12ef');

            tester.button('Войти').click();
            spendTime(0);
            spendTime(0);
            tester.infoRequest().receiveResponse();
            tester.connectWebSocket();
            tester.loginUserRequest().receiveResponse();
            notificationTester.grantPermission();
            tester.operatorsRequest().receiveResponse();
            tester.operatorsGroupsRequest().receiveResponse();
            tester.sitesRequest().receiveResponse();
            tester.systemMessagesRequest().receiveResponse();
            tester.marksRequest().receiveResponse();
            tester.visitorStatesRequest().receiveResponse();
            tester.inviteStatusesRequest().receiveResponse();
            tester.answerTemplatesRequest().receiveResponse();
            tester.operatorReadyRequest().receiveResponse();
            const chatsRequest = tester.chatsRequest().expectToBeSent();
            tester.visitorsRequest().receiveResponse();
            chatsRequest.receiveResponse();
            tester.pingRequest().expectToBeSent();
            tester.componentsRequest().receiveResponse();
            tester.objectMarksRequest().receiveResponse();
            tester.operatorStatusUpdatingRequest().expectToBeSent();

            tester.menuitem('Чаты').click();
            tester.menuitem('Свернуть').click();
        });

        it('', function() {
        });
    });
});
