tests.addTest(function(params) {
    const {
        windowOpener,
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = params;

    describe('Открываю раздел событий.', function() {
        let tester;

        beforeEach(function() {
            tester = new SitemanagementEvent(params);

            tester.eventRequest().receiveResponse();
            tester.segmentRequest().receiveResponse();
            tester.siteEventTypesRequest().receiveResponse();
        });

        afterEach(function() {
            tester.destroy();
        });

        it('', function() {
            tester.checkbox.
                withLabel('Считать событие целью').
                click();

            tester.checkbox.
                withLabel('Расширенная настройка передачи события в UA').
                click();

            tester.button('Да').click();
        });
    });
});
