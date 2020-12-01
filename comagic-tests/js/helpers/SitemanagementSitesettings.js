tests.requireClass('Comagic.sitemanagement.sitesettings.view.ExtYMCallsWindow');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.ExtYMCallsStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.IntegrationRecords');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.UniversalAnalytics');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.SiteIntegrationUStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.SiteUStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.controller.Page');

function SitemanagementSitesettings(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.sitemanagement.sitesettings.controller.Page');

    this.addButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.ul-btn-usual-icon-cls-plus');
    });

    this.clearButton = function () {
        function getTester (index) {
            return testersFactory.createDomElementTester(document.
                querySelectorAll('.ul-btn-usual-icon-cls-clear')[index]);
        }

        return {
            first: function () {
                return getTester(0);
            },
            second: function () {
                return getTester(1);
            }
        }
    };

    this.menuItem = function (text) {
        return testersFactory.createDomElementTester(utils.descendantOfBody().matchesSelector('.x-menu-item-text').
            textEquals(text).find());
    };

    this.conditionMenu = function (text) {
        return testersFactory.createDomElementTester(utils.descendantOfBody().
            matchesSelector('.ul-property-container').textEquals(text).find().querySelector('.ul-property-menu'));
    };

    this.filterContainer = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-filter2panel-filters-container');
    });

    this.floatingForm = testersFactory.createFormTester(function () {
        return utils.getFloatingComponent();
    });

    this.button = function (text) {
        return testersFactory.createDomElementTester(utils.descendantOfBody().matchesSelector('.x-btn-inner').
            textEquals(text).find());
    };

    this.setupYandexCallSendingButton = testersFactory.createDomElementTester(function () {
        return utils.descendantOfBody().matchesSelector('.x-btn-inner').textEquals('Настроить передачу обращений').
            findAllVisible()[0];
    });

    this.tab = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().matchesSelector('.x-tab-inner, .x-btn-inner-ul-selector-medium').
                textEquals(text).find()
        );
    };

    this.batchReloadRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        data: {
                            'comagic:analytics:site': [{
                                id: 23523,
                                name: 'some-site.com'
                            }],
                            'comagic:ppc:ym_call_settings_type': [{
                                id: 'is_sending_enabled',
                                name: 'Включить передачу звонков в Яндекс.Метрику'
                            }, {
                                id: 'page',
                                name: 'Страница, с которой совершен звонок'
                            }, {
                                id: 'talk_duration',
                                name: 'Длительность разговора (сек.)'
                            }],
                            'comagic:talk_option:marks': [{
                                aux_id: 'in_process',
                                aux_id2: 0,
                                id: 378,
                                name: 'В обработке'
                            }, {
                                aux_id: 'not_processed',
                                aux_id2: 0,
                                id: 311,
                                name: 'Не обработано'
                            }, {
                                aux_id: 'not_goal_contact',
                                aux_id2: 0,
                                id: 377,
                                name: 'Нецелевой контакт'
                            }, {
                                aux_id: 'long_tag',
                                aux_id2: 0,
                                id: 379,
                                name: 'Кобыла и трупоглазые жабы искали цезию нашли поздно утром свистящего хна'
                            }]
                        },
                        success: true
                    });
            }
        };
    };

    this.uaIntegrationRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/uaintegration/read/'
                ).respondSuccessfullyWith({
                    success: true,
                    data: []
                });
            }
        };
    };

    this.yandexMetrikaCallsRequest = function () {
        var data = {
            is_sending_enabled: true,
            page: false,
            talk_duration: true
        };

        return {
            setInvalidMarkGroupsFilter: function () {
                data.mark_groups_filter = [[378, 377], [311]];
                return this;
            },
            setFilters: function () {
                data.communication_kind_filter = 'include_only_first_good_contacts';

                data.mark_groups_filter = [{
                    comparison: 'eq',
                    value: [378, 377]
                }, {
                    comparison: 'ne',
                    value: [311]
                }];

                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/ext_goals/yandex.metrika.calls/read/'
                ).expectQueryToContain({
                    site_analytics_id: '928754'
                }).respondSuccessfullyWith({
                    success: true,
                    data: [data]
                });
            }
        };
    };

    this.yandexMetrikaCallsUpdatingRequest = function () {
        var bodyParams = {
            id: undefined,
            communication_kind_filter: 'include_only_first_good_contacts',
            mark_groups_filter: [{
                comparison: 'eq',
                value: [378, 377, undefined]
            }, {
                comparison: 'ne',
                value: [311, undefined]
            }, undefined],
        };

        return {
            removeFirstTag: function () {
                bodyParams.mark_groups_filter = [{
                    comparison: 'eq',
                    value: [377, undefined]
                }, {
                    comparison: 'ne',
                    value: [311, undefined]
                }, undefined];

                return this;
            },
            removeFirstMarkGroup: function () {
                bodyParams.mark_groups_filter = [{
                    comparison: 'ne',
                    value: [311, undefined]
                }, undefined];

                return this;
            },
            duplicateFirstGroup: function () {
                bodyParams.mark_groups_filter = [{
                    comparison: 'eq',
                    value: [378, 377, undefined]
                }, {
                    comparison: 'ne',
                    value: [311, undefined]
                }, {
                    comparison: 'eq',
                    value: [378, 377, undefined]
                }, undefined];

                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/ext_goals/yandex.metrika.calls/update/'
                ).expectQueryToContain({
                    site_analytics_id: '928754',
                    site_id: '23523'
                }).expectBodyToContain(bodyParams).respondSuccessfullyWith({
                    success: true,
                    data: true
                });
            }
        };
    };

    this.yandexMetrikaGoalsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/ext_goals/yandex.metrika.goals/read/'
                ).expectQueryToContain({
                    site_analytics_id: '928754'
                }).respondSuccessfullyWith({
                    success: true,
                    data: []
                });
            }
        };
    };

    this.yandexMetrikaExtUnitsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/ext_units/yandex.metrika/read/'
                ).expectQueryToContain({
                    site_analytics_id: '928754'
                }).respondSuccessfullyWith({
                    success: true,
                    data: [{
                        checked: true,
                        text: '58692'
                    }]
                });
            }
        };
    };

    this.integrationRecordsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/integrationrecords/read/'
                ).respondSuccessfullyWith({
                    success: true,
                    data: []
                });
            }
        };
    };

    this.integrationRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/integration/read/'
                ).respondSuccessfullyWith({
                    success: true,
                    metadata: [{
                        name: 'ext_analytics',
                        fields: [{
                            name: 'param1',
                            type: 'string'
                        }]
                    }, {
                        name: 'analytics',
                        fields: [{
                            name: 'integration_status',
                            type: 'string'
                        }]
                    }, {
                        name: 'site_analytics',
                        fields: [{
                            name: 'site_id',
                            type: 'int'
                        }, {
                            name: 'analytics_id',
                            type: 'int'
                        }, {
                            name: 'engine',
                            type: 'string'
                        }]
                    }],
                    data: {
                        ext_analytics: [{
                            id: 54252,
                            param1: 'val1'
                        }],
                        analytics: [{
                            id: 89283,
                            integration_status: 'ok'
                        }],
                        site_analytics: [{
                            id: 928754,
                            site_id: 23523,
                            analytics_id: 89283,
                            engine: 'yandex.metrika'
                        }]
                    }
                });
            }
        };
    };

    this.siteSettingsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/sitesettings/read/site/23523/'
                ).respondSuccessfullyWith({
                    success: true,
                    metadata: [{
                        name: 'site',
                        fields: [{
                            name: 'domain',
                            type: 'string'
                        }]
                    }, {
                        name: 'site_block',
                        fields: []
                    }],
                    data: {
                        site: [{
                            id: 23523,
                            domain: 'www.somesite.ru',
                            time_zone: '+4',
                            user_phone: '79161234567',
                            cookie_life_time: 2246400,
                            duplicate_interval: 7
                        }],
                        site_block: []
                    }
                });
            }
        };
    };

    this.extraDayDtVisitorCostRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/sitemanagement/sitesettings/extra_day_dt_visitor_cost/'
                ).respondSuccessfullyWith({
                    success: true,
                    data: null
                });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };

    var state = {
        siteId: 23523
    };

    var result = '';

    for (name in state) {
        result += name + '=' + state[name] + '&';
    }

    result = result.substr(0, result.length - 1);

    Comagic.Directory.load();
    this.batchReloadRequest().receiveResponse();

    Comagic.application.stateManager.onHistoryChange(result);
    controller.init();
    controller.actionIndex.apply(controller, arguments);
    
    document.querySelector('.cm-basepage').style.overflow = 'auto';
}
