document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'proposal_generator_frontend_tester', 'path'], function (
        PromiseMock,
        ProposalGeneratorFrontendTester,
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
                ProposalGeneratorFrontendTester: ProposalGeneratorFrontendTester,
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
