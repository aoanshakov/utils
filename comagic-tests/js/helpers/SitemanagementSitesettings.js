tests.requireClass('Comagic.sitemanagement.sitesettings.store.ExtFBFormRecords');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.ExtFBPageRecords');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.ExtAcRecords');
tests.requireClass('Comagic.sitemanagement.sitesettings.view.ExtYMCallsWindow');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.ExtYMCallsStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.IntegrationRecords');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.UniversalAnalytics');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.SiteIntegrationUStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.store.SiteUStore');
tests.requireClass('Comagic.sitemanagement.sitesettings.controller.Page');

var SitemanagementSitesettings = (function () {
    var makeOverrides = function (me) {
        var openUrl;

        function createUrlOpener (me) {
            var actualUrl;

            openUrl = function (url) {
                actualUrl = url;
            };

            me.openedUrl = {
                expectToBe: function (expectedUrl) {
                    const errorMessage = 'URL "' + expectedUrl + '" должен быть открыт в том же окне, тогда как ';

                    if (!actualUrl) {
                        throw new Error(errorMessage + 'никакой URL не был открыт.');
                    }

                    if (expectedUrl != actualUrl) {
                        throw new Error(errorMessage + 'был открыт URL "' + actualUrl + '".');
                    }
                },

                expectNone: function () {
                    if (!actualUrl) {
                        return;
                    }

                    throw new Error(
                        'URL "' + actualUrl + '" был открыт в том же окне, тогда как никакой URL не должен быть открыт.'
                    );
                },
            };
        }

        Ext.define('Comagic.overrides.sitemanagement.sitesettings.store.SiteIntegrationUStore', {
            override: 'Comagic.sitemanagement.sitesettings.store.SiteIntegrationUStore',
            openUrl: function (url) {
                openUrl(url);
            },
        });

        makeOverrides = createUrlOpener;
        createUrlOpener(me);
    };

    return function ({
        requestsManager,
        testersFactory,
        utils,
        wait,
    }) {
        makeOverrides(this);
        var controller = Comagic.getApplication().getController('Comagic.sitemanagement.sitesettings.controller.Page');

        this.checkbox = testersFactory.createDomElementTester('.x-grid-checkcolumn');

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

        this.menu = {
            item: function (text) {
                const tester = testersFactory.createDomElementTester(
                    utils.descendantOfBody().
                        matchesSelector('.x-menu-item-text').
                        textEquals(text).
                        find()
                );

                const click = tester.click.bind(tester);

                tester.click = function () {
                    click();
                    wait();
                };

                return tester;
            }
        };

        this.menuItem = this.menu.item;

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

        function addTesters (me, getRootElement) {
            getRootElement = getRootElement || function () {
                return document.body;
            };

            me.button = function (text) {
                const tester = testersFactory.createDomElementTester(
                    utils.descendantOf(getRootElement()).
                        matchesSelector('.x-btn-inner').
                        textEquals(text).
                        find()
                );

                const click = tester.click.bind(tester);

                tester.click = function () {
                    click();
                    wait();
                };

                return tester;
            };

            return me;
        }

        addTesters(this);

        this.integration = function (text) {
            const getDomElement = function () {
                return utils.descendantOfBody().
                    matchesSelector('.cm-integration-service-logo-header').
                    textEquals(text).
                    find().
                    closest('.x-container').
                    parentNode.
                    closest('.x-container');
            };

            return addTesters(testersFactory.createDomElementTester(getDomElement), getDomElement);
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

        this.leadsUpdateRequest = function () {
            return {
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath('/sitemanagement/sitesettings/update_leads_are_communications/');

                    return {
                        receiveResponse: function () {
                            return request.respondSuccessfullyWith({
                                success: true,
                                data: true,
                            });
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.autoIntegrationSettingsUpdateRequest = function () {
            return {
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath('/sitemanagement/sitesettings/update_auto_integration_settings/');

                    return {
                        receiveResponse: function () {
                            return request.respondSuccessfullyWith({
                                success: true,
                                data: true,
                            });
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.extFbRequest = function () {
            return {
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath('/sitemanagement/sitesettings/extfbpagerecords/read/');

                    return {
                        receiveResponse: function () {
                            return request.respondSuccessfullyWith({
                                success: true,
                                data: [{
                                    ext_id: 58205342,
                                    name: 'Некая сущность',
                                    is_enabled: true,
                                    engine: 'vk.ads',
                                    text: 'Некая группа',
                                    is_available: true,
                                }],
                            });
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.ymSiteIntegrationRequest = function () {
            return {
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath('/directory/comagic:ppc:ym_site_integration/');

                    return {
                        receiveResponse: function () {
                            return request.respondSuccessfullyWith({
                                success: true,
                                data: [],
                            });
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.authUrlRequest = function () {
            const data = 'https://somedomain.com';

            const queryParams = {
                source: 'yandex.metrika',
                customer_id: '',
                site_id: '23523',
                site_analytics_id: '',
                is_iframe: '',
                vk_groups: undefined,
            };

            function addResponseModifiers (me) {
                return me;
            }

            return addResponseModifiers({
                isIframe: function () {
                    queryParams.is_iframe = 'is_iframe';
                    return this;
                },

                vkGroupChecked: function () {
                    queryParams.vk_groups = '[{' +
                        '"ext_id":58205342,' +
                        '"name":"\\u041d\\u0435\\u043a\\u0430\\u044f \\u0441\\u0443\\u0449\\u043d\\u043e\\u0441' +
                            '\\u0442\\u044c",' +
                        '"is_enabled":true,' +
                        '"engine":"vk.ads",' +
                        '"text":"\\u041d\\u0435\\u043a\\u0430\\u044f \\u0433\\u0440\\u0443\\u043f\\u043f\\u0430",' +
                        '"is_available":true,' +
                        '"checked":true' +
                    '}]';

                    return this;
                },

                vkAds: function () {
                    queryParams.source = 'vk.ads';
                    queryParams.customer_id = '3423432';
                    queryParams.site_analytics_id = '42875';

                    return this;
                },

                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath(
                            '/sitemanagement/sitesettings/get_auth_url/'
                        ).expectQueryToContain(queryParams);

                    return addResponseModifiers({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                success: true,
                                data,
                            });
                        }
                    });
                },

                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
            });
        };

        this.batchReloadRequest = function () {
            return {
                receiveResponse: function () {
                    requestsManager.recentRequest().
                        expectToHavePath('/directory/batch_reload/').
                        expectToHaveMethod('POST').
                        respondSuccessfullyWith({
                            data: {
                                'comagic:ppc:auto_integration_operator': [{
                                    id: 58205,
                                    is_default: true,
                                }],
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
            const data = [{
                is_sending_enabled: true,
                page: false,
                talk_duration: true
            }];

            function addResponseModifiers (me) {
                me.setInvalidMarkGroupsFilter = function () {
                    data[0].mark_groups_filter = [[378, 377], [311]];
                    return me;
                };

                me.setFilters = function () {
                    data[0].communication_kind_filter = 'include_only_first_good_contacts';

                    data[0].mark_groups_filter = [{
                        comparison: 'eq',
                        value: [378, 377]
                    }, {
                        comparison: 'ne',
                        value: [311]
                    }];

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath(
                            '/sitemanagement/sitesettings/ext_goals/yandex.metrika.calls/read/'
                        ).expectQueryToContain({
                            site_analytics_id: '928754'
                        });

                    return addResponseModifiers({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                success: true,
                                data,
                            });
                        }
                    });
                },

                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
            });
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
            const data = [{
                checked: true,
                text: '58692'
            }];

            function addResponseModifiers (me) {
                me.noData = function () {
                    data.splice(0, data.length);
                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath(
                            '/sitemanagement/sitesettings/ext_units/yandex.metrika/read/'
                        ).expectQueryToContain({
                            site_analytics_id: '928754'
                        });

                    return addResponseModifiers({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                success: true,
                                data,
                            });
                        },
                    });
                },

                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                },
            });
        };

        this.integrationRecordsRequest = function () {
            const data = [{
                id: 928754,
                is_limit_exhausted: false,
                analytics_id: 89283,
                integration_status: 'ok',
                sync_status: 'ok',
                error_details: null,
                last_load_date: '2023-01-01 12:12:12',
                pc_count: 0,
                number_pool: null,
                ac_name: 'Некая рекламная кампания',
                ext_manager_id: '2423524_4224252',
                engine: 'vk.ads',
                ext_customer_id: 3423432,
                site_analytics_id: 42875,
            }];

            function addResponseModifiers (me) {
                me.tokenExpired = function () {
                    data[0].integration_status = 'token_expired';
                    data[0].sync_status = 'empty';

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    return addResponseModifiers({
                        receiveResponse: function () {
                            requestsManager.recentRequest().expectToHavePath(
                                '/sitemanagement/sitesettings/integrationrecords/read/'
                            ).respondSuccessfullyWith({
                                success: true,
                                data,
                            });
                        },
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.integrationRequest = function () {
            const data = {
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
            };

            function addResponseModifiers (me) {
                me.noSiteAnalytics = function () {
                    data.site_analytics.splice(0, data.site_analytics.length);
                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = requestsManager.recentRequest().
                        expectToHavePath('/sitemanagement/sitesettings/integration/read/');

                    return addResponseModifiers({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
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
                                data,
                            });
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
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

        this.actionIndex = function () {
            controller.init();
            controller.actionIndex.apply(controller, arguments);

            document.querySelector('.cm-basepage').style.overflow = 'auto';
        };
    };
})();
