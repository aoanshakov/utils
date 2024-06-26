document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs([
        'promise-mock',
        'tester',
        'softphone-tester',
        'sip',
        'fake-require',
        'sound-sources',
        'amocrm-lead',
    ], function (
        PromiseMock,
        Tester,
        SoftphoneTester,
        Sip,
        FakeRequire,
        soundSources,
        amocrmLead,
    ) {
        describe('', function() {
            beforeEach(function() {
                PromiseMock.install();
                tests.beforeEach();
            });

            afterEach(function() {
                tests.afterEach();
            });

            tests.runBeforeTestsExecution(options => {
                const unfilteredPostMessages = options.postMessages;
                options.unfilteredPostMessages = unfilteredPostMessages;

                options.postMessages = {
                    nextMessage: () => {
                        while (true) {
                            const message = unfilteredPostMessages.nextMessage();

                            if (!message.startsWith('ignore:')) {
                                return message;
                            }
                        }
                    },

                    receive: message => unfilteredPostMessages.receive(message),
                };
            });

            const WrappedTester = function (options) {
                options.softphoneHost = options.softphoneHost || '$REACT_APP_SOFTPHONE_BACKEND_HOST';
                options.softphoneTester = new SoftphoneTester(options);
                options.amocrmLead = amocrmLead;

                return new Tester(options);
            };

            WrappedTester.createPackagesGetter = args => {
                let packages;
                const {FakeRequire, spendTime} = args;

                beforeEach(function() {
                    packages = new FakeRequire(args);
                    packages.replaceByFake();
                });

                afterEach(function() {
                    window.localStorage.removeItem('electronCookies');

                    spendTime(0);
                    spendTime(0);

                    packages.electron.ipcRenderer.expectNoMessageToBeSent();
                });

                return packageName => packageName != 'replaceByFake' ? packages[packageName] : null;
            };

            try {
                tests.runTests({
                    Sip,
                    FakeRequire: FakeRequire,
                    soundSources,
                    Tester: WrappedTester 
                });
            } catch (e) {
                console.log(e);
            }
        });

        jasmine.getEnv().execute();
    });
});
