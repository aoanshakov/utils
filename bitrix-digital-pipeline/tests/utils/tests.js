document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs([
        'promise-mock',
        'robot_settings_tester',
        'time_field_template_tester'
    ], function (
        PromiseMock,
        RobotSettingsTester,
        TimeFieldTemplateTester
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
                RobotSettingsTester,
                TimeFieldTemplateTester
            });
        });

        jasmine.getEnv().execute();
    });
});
