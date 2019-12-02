document.addEventListener('DOMContentLoaded', function () {
    requirejs.config({
        baseUrl: '/amocrm-widget',
        paths: {
            cmg: '/amocrm-widget'
        }
    });

    requirejs(['promise-mock', 'underscore', 'backbone', 'helpers', 'modal-window'], function (
        PromiseMock, Underscore, Backbone, helpers, showModalWindow
    ) {
        helpers.createSetuper(function (options) {
            var files = options.files,
                setup = options.setup;

            describe('', function() {
                beforeEach(function() {
                    PromiseMock.install();
                    tests.beforeEach();
                });

                afterEach(function() {
                    window.AMOCRM.router.reset();
                    tests.afterEach();
                });

                tests.runTests(setup, helpers.Sip, files, helpers.PhoneActionModel, showModalWindow);
            });

            jasmine.getEnv().execute();
        });
    });
});
