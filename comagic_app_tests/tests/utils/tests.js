document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'tester', 'softphone-tester', 'sip', 'sound-sources'], function (
        PromiseMock,
        Tester,
        SoftphoneTester,
        Sip,
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
                soundSources,
                Tester: function (options) {
                    options.softphoneTester = new SoftphoneTester({
                        ...options,
                        softphoneHost: 'myint0.dev.uis.st'
                    });

                    return new Tester(options);
                } 
            });
        });

        jasmine.getEnv().execute();
    });
});
