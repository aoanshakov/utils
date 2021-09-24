Ext.application({
    extend: 'EasyStart.controller.Application',
    name: 'EasyStart',
    appFolder: '/static/easystart/app',
    requires: tests.getRequiredClasses(),
    initializePartnerSpecificity: function () {
        this.callParent(arguments);
        this.initializePartnerSpecificity = Ext.emptyFn;
    },
    removeMask: function () {
        this.callParent(arguments);
        this.removeMask = Ext.emptyFn;
    },
    launch: function() {
        var me = this,
            viewport;
        
        tests.handleBeginingOfTestsExecution();

        Ext.Ajax.abort = function (request) {
            request.timedout = false;
        };

        Ext.define('Comagic.test.form.Basic', {
            override: 'Ext.form.Basic',
            taskDelay: 0
        });

        Ext.define('Comagic.test.fx.Anim', {
            override: 'Ext.fx.Anim',
            autoEnd: true,
            constructor: function (config) {
                config.paused = false;
                config.autoEnd = true;
                this.callParent(arguments);
            }
        });

        this.findComponent = function(selector) {
            return viewport.down(selector);
        };

        var createViewport = this.createViewport;
        this.createViewport =  function () {
            viewport = createViewport.apply(this, arguments);
            return viewport;
        };

        describe('Открываю легкий вход.', function() {
            beforeEach(function() {
                window.location.hash = '';

                Ext.Ajax.requests = {};
                tests.beforeEach();

                function destroy(component) {
                    if (component.ownerCt) {
                        destroy(component.ownerCt);
                        return;
                    }

                    if (
                        component.$className != 'Ext.dd.StatusProxy' &&
                        component != Ext.tip.QuickTipManager.tip
                    ) {
                        if (component.getId() == 'ext-form-error-tip') {
                            component.hide();
                        } else if (
                            component.$className != 'Ext.window.MessageBox'
                        ) {
                            component.destroy();
                        } else {
                            if (component.el && !component.hidden) {
                                component.userCallback = Ext.emptyFn;
                                component.close();
                            }
                        }
                    }
                }

                Ext.ComponentManager.each(function() {
                    destroy(arguments[1]);
                });

                if (Ext.WindowManager.mask) {
                    Ext.WindowManager.mask.destroy();
                    Ext.WindowManager.mask = null;
                }

                Ext.data.StoreManager.removeAll();

                var emptyStore = Ext.regStore('ext-empty-store', {
                    proxy: 'memory',
                    useModelWarning: false
                });

                emptyStore.isEmptyStore = true;
                emptyStore.add =
                emptyStore.remove =
                emptyStore.insert =
                emptyStore.load =
                emptyStore.loadData = function() {
                    Ext.Error.raise(
                        'Cannot modify ext-empty-store'
                    );
                };
            });

            afterEach(function() {
                window.location.hash = '';

                expect(1).toBe(1);
                tests.afterEach();
                Ext.tip.QuickTipManager.tip.hide();
            });

            tests.runTests();
        });

        jasmine.getEnv().execute();
    }
});
