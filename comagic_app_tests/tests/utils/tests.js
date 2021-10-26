document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'tester', 'softphone-tester', 'sip'], function (
        PromiseMock,
        Tester,
        SoftphoneTester,
        Sip
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
                Tester: function (options) {
                    options.softphoneTester = new SoftphoneTester(options);
                    return new Tester(options);
                } 
            });
        });

        jasmine.getEnv().execute();
    });
});
