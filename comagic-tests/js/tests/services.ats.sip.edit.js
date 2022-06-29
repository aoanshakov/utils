tests.addTest(args => {
    var wait = args.wait;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/SIP-линии". Выбираю SIP-линию для редактирования.', function() {
        let tester;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new ServicesAtsSipEditPage(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                recordId: 210948
            });

            wait();

            tester.sipLineRequest().receiveResponse();
            tester.sipLimitsRequest().receiveResponse();
        });

        it('', function() {
        });
    });
});
