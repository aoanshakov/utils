document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/js'
    });

    requirejs(['promise-mock', 'sip', 'call-center-tester'], function (PromiseMock, Sip, CallCenterTester) {
        describe('', function() {
            beforeEach(function() {
                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runTests(Sip, CallCenterTester);
        });

        jasmine.getEnv().execute();
    });
});
