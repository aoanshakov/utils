tests.addTest(options => {
    const {
        Tester,
        spendTime,
        utils
    } = options;

    describe('Открываю софтфон.', function() {
        let tester;

        beforeEach(function() {
            tester = new Tester(options);
            tester.configRequest().receiveResponse();
        });

        it('Показываю софтфон. Кнопка вызова заблокирована.', function() {
            tester.store.toggleSoftphoneVisiblity();
            spendTime(0);

            tester.callButton.expectToHaveAttribute('disabled');
        });
        it('Софтфон скрыт.', function() {
            tester.callButton.expectNotToExist();
        });
    });
});
