document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/js'
    });

    requirejs([
        'promise-mock', 'sip', 'call-center-tester', 'sound-sources'
    ], function (PromiseMock, Sip, CallCenterTester, soundSources) {
        describe('', function() {
            beforeEach(function() {
                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runTests({
                Sip: Sip,
                CallCenterTester: CallCenterTester,
                soundSources: soundSources
            });
        });

        jasmine.getEnv().execute();
    });
});
