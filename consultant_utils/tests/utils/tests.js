document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'consultant_tester', 'path'], function (
        PromiseMock,
        ConsultantTester,
        Path
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
                ConsultantTester: ConsultantTester,
                runApplication: ({utils}) => {
                    var result = {};

                    window.application.run({
                        setHistory: history => (result.path = new Path({history, utils}))
                    });

                    return result;
                } 
            });
        });

        jasmine.getEnv().execute();
    });
});
