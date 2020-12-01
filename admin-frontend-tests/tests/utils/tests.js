document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'admin-frontend-tester'], function (PromiseMock, AdminFrontendTester) {
        describe('', function() {
            let tasks = [],
                history,
                openPath;

            beforeEach(function() {
                history = null;
                openPath = path => tasks.push(() => openPath(path));

                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runTests({
                openPath: path => openPath(path),
                AdminFrontendTester: AdminFrontendTester,
                runApplication: () => window.application.run(value => {
                    history = value;
                    openPath = path => history.push(path);
                    tasks.forEach(task => task());
                })
            });
        });

        jasmine.getEnv().execute();
    });
});
