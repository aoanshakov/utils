document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'admin-frontend-tester', 'path'], function (PromiseMock, AdminFrontendTester, Path) {
        describe('', function() {
            beforeEach(function() {
                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runTests({
                AdminFrontendTester: AdminFrontendTester,
                runApplication: ({utils}) => {
                    var result = {};

                    window.application.run(history => {
                        result.path = new Path({history, utils});
                    }, value => (result.app = value))

                    return result;
                } 
            });
        });

        jasmine.getEnv().execute();
    });
});
