Ext.application({
    name: 'Comagic',
    appFolder: '/static/comagic/app',
    requires: tests.getRequiredClasses(),
    launch: function() {
        var viewport,
            me = this;

        tests.handleBeginingOfTestsExecution();
        
        Ext.Ajax.abort = function (request) {
            request.timedout = false;
        };

        Ext.create('Comagic.base.helper.app.ErrorProcessor', { controller: me });

        Ext.define('Comagic.test.main.controller.West', {
            override: 'Comagic.main.controller.West',
            collapseMenuTrees: Ext.emptyFn
        });

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

        Ext.define('Comagic.test.Viewport', {
            extend: 'Ext.container.Viewport',
            layout: 'fit',
            itemId: 'main-container',
            region: 'center',
            setMainViewFlex: Ext.emptyFn,
            down: function(selector) {
                if (selector == '#main-view') {
                    return this;
                }

                return this.callParent(arguments);
            }
        });

        Ext.define('Comagic.base.report.component.Grid', {
            override: 'Comagic.base.report.component.Grid',
            getScrollableEl: function () {
                return Comagic.getApplication().getViewport();
            }
        });

        Comagic.lookupUStore = ULib.ux.data.UStore.lookup;
        Comagic.application = this;
        Comagic.Directory = Comagic.base.Directory;
        Comagic.lmc = localizationMC;
        Comagic.EventTracker = Comagic.base.eventtracker.EventTracker;
        Comagic.Utils = ULib.ux.utils.Utils;
        Comagic.Dlg = Comagic.base.dialog.Dialog;
        Comagic.account.appId = '4735';
        window.isGodMode = true;

        var absentAppParameters = {};

        Comagic.Directory.getAppParameter = function(name) {
            if (absentAppParameters[name]) {
                return 0;
            }

            return 12;
        };

        ['common', 'core', 'interfaces'].forEach(function (unit) {
            if (unit in Comagic.lmc) {
                for (var className in Comagic.lmc[unit]) {
                    Ext.define('Override.' + className, Ext.apply({
                        override: className
                    }, Comagic.lmc[unit][className]));
                }
            }
        });

        this.selectSite = function () {
        };
        this.getCurrentPage = function() {
            return viewport;
        };
        this.getMainPanel = function() {
            return viewport;
        };
        this.getViewport = function() {
            return viewport;
        };

        var absentComponents = {},
            unavailableFeatures = {};

        function createKeyChecker (collection) {
            return function(name) {
                if (name in collection) {
                    return false;
                }

                return true;
            };
        }

        Comagic.Permission = this.Permission = {
            useSiteCategory: function () {
                return true;
            },
            hasSiteSimpleDtModel: function () {
                return true;
            },
            hasSiteOnDemandDtModel: function () {
                return true;
            },
            isAdmin: function () {
                return true;
            },
            hasDataAPIComponent: function () {
                return true;
            },
            hasNumbersInTp: function() {
                return true;
            },
            hasAnyOfComponents:  function(args) {
                var me = this;
                args = Ext.isArray(args) ? args : Ext.Array.slice(arguments);
                return args.reduce(function(x, y) {
                    return x || me.hasComponent(y);
                }, false);
            },
            hasComponent: createKeyChecker(absentComponents),
            hasFeature: createKeyChecker(unavailableFeatures),
            hasVaComponent: function() {
                return this.hasComponent('va');
            },
            convertControllerNameToMnemonic: function() {
                var permission = Comagic.base.permission.Permission;
                return permission.convertControllerNameToMnemonic.apply(
                    permission, arguments);
            },
            isAppBlocked: function() {
                return false;
            },
            isAgent: function() {
                return false;
            },
            getPermission: function() {
                return ['r', 'u', 'c'];
            },
            checkWrite: function () {
                return true;
            },
            checkRead: function () {
                return true;
            },
            isSalesEnabled: function () {
                return true;
            },
            hasSiteAddPermission: function () {
                return true;
            },
            isAgentsApp: function () {
                return false;
            },
            checkIndexPermission: function () {
                return true;
            },
            isAppArchived: function () {
                return false;
            },
            checkCreatePermission: function () {
                return true;
            },
            isAppActivated: function () {
                return true;
            },
            hasSimpleDtComponent: function () {
                return true;
            }
        };

        this.switchAppMode = function () {
        };

        this.getControllerMode = function () {
            return 'statistics';
        };

        this.getControllerClass = function (name) {
            return {};
        };

        this.stateManager = Ext.create('Comagic.base.StateManager', {
            app: this
        });

        this.setSiteId = function() {
        };

        this.enableActionRunning = function () {
            this.runAction = function(controllerName, actionName, params, stateDiff) {
                var controller = this.getController(controllerName);
                controller.init();
                return controller['action' + actionName]({}, params, {});
            };
        };

        this.disableActionRunning = function () {
            this.runAction = function() {};
        };

        this.disableActionRunning();

        this.stateManager.setState({
            dateRange: {
                startDate: null,
                endDate: null,
                compareStartDate: null,
                compareEndDate: null
            }
        });

        this.setHeadTitle = function () {
        };
        this.setFeatureUnavailable = function (name) {
            unavailableFeatures[name] = true;
        };
        this.setHasNoVaComponent = function() {
            absentComponents.va = true;
        };
        this.setHasNoAppParameter = function(name) {
            absentAppParameters[name] = true;
        };
        this.setHasNotComponent = function(name) {
            absentComponents[name] = true;
        };
        this.findComponent = function(selector) {
            return viewport.down(selector);
        };
        this.findComponents = function(selector) {
            return viewport.query(selector);
        };
        this.onPageIndex = function() {
            this.addToViewport(arguments[1]);
        };
        this.addToViewport = function(component) {
            viewport.removeAll();
            viewport.add(component);
        };
        this.maskMainView = Ext.emptyFn;

        describe('Открываю личный кабинет.', function() {
            beforeEach(function() {
                window.location.hash = '';

                Comagic.account.project = 'comagic';
                Comagic.settings.pageTitle = 'CoMagic';

                if (Comagic.Directory && Comagic.Directory.stores) {
                    Comagic.Directory.stores = {};
                }

                Comagic.application.stateManager.state.controller = {};

                function clearObject (object) {
                    Object.keys(object).forEach(function (key) {
                        delete(object[key]);
                    });
                }

                clearObject(absentComponents);
                clearObject(unavailableFeatures);

                if (ULib && ULib.ux && ULib.ux.data && ULib.ux.data.UStore) {
                    ULib.ux.data.UStore._instances = {};
                }

                Ext.Ajax.deferredRequests = {};
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

                viewport = Ext.create('Comagic.test.Viewport');
                viewport.up = function () {
                    return viewport;
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
    }
});
