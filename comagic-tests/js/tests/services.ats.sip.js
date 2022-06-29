tests.addTest(args => {
    var wait = args.wait;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/SIP-линии".', function() {
        let tester;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new ServicesAtsSip(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex();
            wait();

            tester.sipRecordsRequest().isMobileTerminalEnabled().receiveResponse();
            tester.employeesRequest().receiveResponse();
            tester.batchReloadRequest().receiveResponse();
            tester.sipLimitsRequest().receiveResponse();
        });

        it('', function() {
        });
    });
});
