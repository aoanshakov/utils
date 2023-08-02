tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/Виртуальные номера и правила".', function() {
        var tester;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new ServicesAtsScenario(args);

            //Comagic.Directory.load();
            //batchReloadRequest = tester.batchReloadRequest().expectToBeSent();
            tester.actionIndex();
            tester.scenariosRequest().receiveResponse();
        });

        it('', function() {
            tester.grid.
                row().first().
                createTester().forDescendant('.ul-action-remove').
                click();

            tester.scenarioRemovingAvailabilityRequest().
                unavailable().
                receiveResponse();

            wait();
        });
    });
});
