document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'tester', 'softphone-tester', 'sip', 'fake-require', 'sound-sources'], function (
        PromiseMock,
        Tester,
        SoftphoneTester,
        Sip,
        FakeRequire,
        soundSources
    ) {
        describe('', function() {
            beforeEach(function() {
                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runTests({
                Sip,
                FakeRequire: FakeRequire,
                soundSources,
                Tester: function (options) {
                    options.softphoneTester = new SoftphoneTester(options);
                    return new Tester(options);
                } 
            });
        });

        jasmine.getEnv().execute();
    });
});
