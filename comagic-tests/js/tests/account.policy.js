tests.addTest(function(params) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = params;

    describe('Открываю раздел "Аккаунт/Правила и настройки безопасности/Виджеты".', function() {
        let tester;

        afterEach(function() {
            tester.destroy();
        });

        describe('Открываю третью вкладку.', function() {
            let policyRequest;

            beforeEach(function() {
                window.isIFrame = true;

                tester = new AccountPolicy(params);
                tester.actionIndex(3);

                tester.sipLinesRequest().receiveResponse();
                tester.sipTrunkRequest().receiveResponse();
                policyRequest = tester.policyRequest().expectToBeSent();

                tester.ipsRequest().receiveResponse();
                tester.personalAccountIpsRequest().receiveResponse();
                tester.blackListRequest().receiveResponse();
            });

            it('Произошла ошибка.', function() {
                policyRequest.
                    failed().
                    receiveResponse();

                tester.window.expectTextContentToHaveSubstring(
                    'Произошла непредвиденная ошибка, обратитесь к вашему менеджеру'
                );
            });
            it('Открыта третья вкладка.', function() {
                policyRequest.receiveResponse();

                tester.body.expectTextContentToHaveSubstring('Черный список');
                tester.tabBar.expectToBeHiddenOrNotExist();
                tester.pageHeader.expectToBeHiddenOrNotExist();
            });
        });
        describe('Открываю все вкладки.', function() {
            let policyRequest;

            beforeEach(function() {
                window.isIFrame = false;

                tester = new AccountPolicy(params);
                tester.actionIndex();

                tester.sipLinesRequest().receiveResponse();
                tester.sipTrunkRequest().receiveResponse();
                policyRequest = tester.policyRequest().expectToBeSent();
                tester.ipsRequest().receiveResponse();
                tester.personalAccountIpsRequest().receiveResponse();
                tester.blackListRequest().receiveResponse();
            });

            it('Произошла ошибка.', function() {
                policyRequest.
                    failed().
                    receiveResponse();

                tester.window.expectTextContentToHaveSubstring('Произошла непредвиденная ошибка.');
            });
            it('Открыта панель вкладок.', function() {
                tester.body.expectTextContentToHaveSubstring('Местные мобильные');
                tester.tabBar.expectToBeVisible();
                tester.pageHeader.expectToBeVisible();
            });
        });
    });
});
