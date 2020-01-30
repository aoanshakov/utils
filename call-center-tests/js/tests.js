document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/js'
    });

    requirejs([
        'promise-mock', 'sip', 'softphone-tester', 'call-center-tester', 'amocrm-widget-tester', 'sound-sources',
        'amocrm-global'
    ], function (
        PromiseMock, Sip, SoftphoneTester, CallCenterTester, AmocrmWidgetTester, soundSources, AmocrmGlobal
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
                Sip: Sip,
                soundSources: soundSources,
                AmocrmGlobal: AmocrmGlobal,
                CallCenterTester: function (options) {
                    options.initialize = function () {
                        var root = document.getElementById('root');

                        if (root) {
                            window.application.exit();
                            root.remove();
                        }

                        document.body.innerHTML = '<div id="root"></div>';
                        window.application.run();
                    };

                    options.softphoneTester = new SoftphoneTester(options);
                    return new CallCenterTester(options);
                },
                AmocrmWidgetTester: function (options) {
                    options.initialize = function () {
                        window.application.run();

                        const style = document.querySelector('#cmg-amocrm-widget').style;
                        style.bottom = style.right = 'auto';
                        style.top = style.left = '50px';
                    };

                    options.softphoneTester = new SoftphoneTester(options);
                    return new AmocrmWidgetTester(options);
                }
            });
        });

        jasmine.getEnv().execute();
    });
});
