document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/tests/utils'
    });

    requirejs(['promise-mock', 'tester', 'softphone-tester', 'sip', 'fake-require', 'sound-sources'], function (
        PromiseMock,
        Tester,
        SoftphoneTester,
        Sip,
        FakeRequire,
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

            const WrappedTester = function (options) {
                options.softphoneTester = new SoftphoneTester({
                    ...options,
                    softphoneHost: 'myint0.dev.uis.st'
                });

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
                    window.getElectronCookiesManager().reset();
                    spendTime(0);

                    packages.electron.ipcRenderer.expectNoMessageToBeSent();
                });

                return packageName => packageName != 'replaceByFake' ? packages[packageName] : null;
            };

            tests.runTests({
                Sip,
                FakeRequire: FakeRequire,
                soundSources,
                Tester: WrappedTester 
            });
        });

        jasmine.getEnv().execute();
    });
});
