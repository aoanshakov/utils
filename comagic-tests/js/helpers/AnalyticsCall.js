tests.requireClass('Comagic.analytics.call.store.CallParameters');
tests.requireClass('Comagic.base.store.Goals');
tests.requireClass('Comagic.analytics.call.controller.Page');

function AnalyticsCall(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.analytics.call.controller.Page'),
        params = {};

    this.setCameFromReview = function () {
        params = {
            defaultParametersValues: {
                mode: 'site'
            },
            filters: {
                allTabs: [{
                    field: 'id',
                    value: [938201, 83820],
                    comparison: 'eq',
                    type: 'system',
                    displayAs: 'Переход из отчёта <span style="color: #000;">Обзорный отчет</span>'
                }]
            },
            previousPageController: 'Comagic.analytics.review.controller.Page'
        };

        return this;
    };

    this.actionIndex = function () {
        controller.init();

        controller.actionIndex({
            siteId: 3825,
            dateRange: {
                startDate: Ext.Date.add(new Date(1566819513815), Ext.Date.DAY, -5),
                endDate: new Date(1566819513815)
            }
        }, params);

        document.querySelector('.cm-basepage').style.overflow = 'auto';
    };

    this.tagsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath('/analytics/call/tag/read/').respondSuccessfullyWith({
                    success: true,
                    total: 3,
                    data: [{
                        cnt: 21,
                        name: 'Не обработано',
                        auto_set_site_ids: null,
                        is_system: false,
                        is_in_use: true,
                        auto_set_communication_types: null,
                        is_auto_set: false,
                        base_in_analyze_models: null,
                        user_mark_cnt: 0,
                        id: 311
                    }, {
                        cnt: 21,
                        name: 'Нецелевой контакт',
                        auto_set_site_ids: null,
                        is_system: false,
                        is_in_use: true,
                        auto_set_communication_types: null,
                        is_auto_set: false,
                        base_in_analyze_models: null,
                        user_mark_cnt: 0,
                        id: 377
                    }, {
                        cnt: 21,
                        name: 'В обработке',
                        auto_set_site_ids: null,
                        is_system: false,
                        is_in_use: true,
                        auto_set_communication_types: null,
                        is_auto_set: false,
                        base_in_analyze_models: null,
                        user_mark_cnt: 0,
                        id: 378
                    }]
                });
            }
        };
    };

    this.requestSettingsUpdate = function () {
        var bodyParams = {};

        return {
            setOnlyAdvertisingCampaign: function () {
                bodyParams.calls_columns = ['ac_name'];
                return this;
            },
            setOnlyEmployeeName: function () {
                bodyParams.calls_columns = ['employee_name'];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/settings/update/').
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            },
        };
    };

    this.requestParameterHints = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:parameter_hints/').
                    testQueryParam('list_filter_params', function (value) {
                        utils.expectToContain(JSON.parse(value), {
                            site_id: '3825',
                            parameter: 'ac',
                            function_name: 'report.get_filter_ac'
                        });
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: -1,
                            name: 'Посетители без рекламной кампании'
                        }]
                    });
            }
        };
    };

    this.batchReloadRequest = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:report:is_lost': [{
                                id: 'lost',
                                name: 'Потерянный'
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
                            }]
                        }
                    });
            }
        };
    };

    this.requestCallChartData = function () {
        var bodyParams = {
            start_date: ['2019-08-21 14:38:33'],
            end_date: ['2019-08-26 23:59:59'],
            site_id: ['3825'],
            aggregation: ['hour'],
            parameter: ['day']
        };

        var dateRange = {
            start_date: '2019-08-21 14:38:33',
            end_date: '2019-08-26 23:59:59'
        };

        var request = requestsManager.recentRequest(),
            filter = [];

        return {
            setNoFilter: function () {
                bodyParams.filter = ['[]'];
                return this;
            },
            setNotWithoutAdvertisingCampaign: function () {
                filter.push({
                    comparison: 'ne',
                    field: 'ac_name',
                    value: ['Посетители без рекламной кампании']
                });

                return this;
            },
            setCameFromReview: function () {
                filter.push({
                    field: 'id',
                    value: [938201, 83820],
                    comparison: 'eq'
                });

                return this;
            },
            changeStartDate: function () {
                dateRange.start_date = '2019-08-13 00:00:00';
                bodyParams.start_date = [dateRange.start_date];
                return this;
            },
            send: function () {
                return request.
                    expectToHavePath('/analytics/call/get_chart_data/').
                    expectToHaveMethod('POST').
                    testBodyParam('date_range', function (value) {
                        utils.expectToContain(JSON.parse(value), dateRange);
                    }).
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            date: '2018-10-16 00:00:00'
                        }, {
                            date: '2018-10-17 00:00:00'
                        }],
                        metaData: {
                            fields: [{
                                name: 'date'
                            }]
                        }
                    });
            },
        };
    };

    this.requestCallFilters = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/filters/read/').
                    expectQueryToContain({
                        mode: 'site'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: []
                    });
            }
        };
    };

    this.filtersUpdatingRequest = function () {
        return {
            receiveResponse: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/filters/update/').
                    expectQueryToContain({
                        mode: 'site'
                    }).
                    expectBodyToContain({
                        name: 'Некий фильтр',
                        contains_sale:  false,
                        filters: [{
                            comparison: 'eq',
                            field: 'id',
                            type: 'system',
                            value: [938201, 83820],
                            isDimension: null,
                            displayAs: 'Переход из отчёта <span style="color: #000;">Обзорный отчет</span>'        
                        }]
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestGridData = function () {
        var bodyParams = {
            start_date: ['2019-08-21 14:38:33'],
            end_date: ['2019-08-26 23:59:59'],
            site_id: ['3825'],
            aggregation: ['hour'],
            parameter: ['day'],
            checkFilterAtServer: ['false']
        };

        var dateRange = {
            start_date: '2019-08-21 14:38:33',
            end_date: '2019-08-26 23:59:59'
        };

        var response = {
            success: true,
            data: [{
                id: 938201,
                employee_name: 'Иванов Иван Иванович',
                ac_name: 'Посетители без рекламной кампании',
                marks: ['Не обработано', 'Нецелевой контакт'],
                numa: '79451234567',
                is_auto_sale: true,
                component: 'Звонок из внешней системы',
                component_id: 'upload_calls',
                direction: 'in',
                crm_contact_name: 'Ивановский Иваний Иваниевич',
                crm_contact_link: 'https://comaigc.amocrm.ru/contacts/detail/42574735'
            }, {
                id: 938202,
                employee_name: 'Петров Петр Петрович',
                ac_name: 'Посетители без рекламной кампании',
                marks: [],
                numa: '79451234568',
                is_auto_sale: true,
                component: 'Автоперезвон из CRM',
                component_id: 'amocrm_extended_integration',
                direction: 'in',
                crm_contact_name: 'Петровский Петроний Петрониевич',
                crm_contact_link: 'https://comaigc.amocrm.ru/contacts/detail/42574736'
            }],
            metaData: {
                fields: ['id', 'employee_name', 'ac_name', 'numa', 'is_auto_sale', 'marks'],
                grid: [{
                    description: 'Тип звонка',
                    filterName: 'Тип звонка',
                    filterType: 'list',
                    name: 'component',
                    text: 'Тип',
                    valueElData: 'directory',
                    _grid_only: true,
                    listFilterParams: {
                        directory_name: 'comagic:public:call_session_component',
                        site_id: '3825'
                    }
                }, {
                    description: 'Номер абонента',
                    filterType: 'text',
                    name: 'numa',
                    text: 'Номер абонента',
                    user_permission_units: {
                        visitor_contact_details: 'is_select'
                    },
                    _grid_only: true
                }, {
                    description: 'Идентификатор сессии звонка',
                    filterType: 'text',
                    name: 'id',
                    _grid_only: true
                }, {
                    description: 'Сотрудник',
                    filterType: 'list',
                    listFilterParams: {
                        directory_name: 'comagic:staff:employee',
                        site_id: '3825'
                    },
                    name: 'employee_name',
                    text: 'Сотрудник',
                    valueElData: 'directory'
                }, {
                    description: 'Рекламная кампания',
                    filterType: 'list',
                    listFilterParams: {
                        site_id: '3825',
                        parameter: 'ac',
                        function_name: 'report.get_filter_ac'
                    },
                    name: 'ac_name',
                    requirements: ['call_tracking', 'consultant', 'sitephone', 'lead'],
                    text: 'Рекламная кампания',
                    user_permission_units: {
                        ac_new: 'is_insert',
                        ac_ext: 'is_select',
                        ac: 'is_select',
                        site_new: 'is_insert'
                    },
                    valueElData: 'function'
                }, {
                    description: 'Теги',
                    filterType: 'array_list',
                    listFilterParams: {
                        directory_name: 'comagic:talk_option:marks',
                        site_id: '3825'
                    },
                    name: 'marks',
                    text: 'Теги',
                    user_permission_units: {
                        tag_management: 'is_select'
                    },
                    valueElData: 'directory'
                }, {
                    name: 'is_auto_sale',
                    _grid_only: true
                }, {
                    description: 'Контакт из CRM',
                    filterType: 'text',
                    name: 'crm_contact_name',
                    text: 'Контакт из CRM'
                }]
            }
        };

        var request = requestsManager.recentRequest(),
            filter = [];

        return {
            setOnlyAdvertisingCampaign: function () {
                delete(response.data.employee_name);
                response.metaData.grid[2].excluded = true;
                response.metaData.fields = ['id', 'ac_name', 'numa', 'is_auto_sale'];
                return this;
            },
            setOnlyEmployeeName: function () {
                delete(response.data.ac_name);
                response.metaData.grid[3].excluded = true;
                response.metaData.fields = ['id', 'employee_name', 'numa', 'is_auto_sale'];
                return this;
            },
            setNoFilter: function () {
                bodyParams.filter = ['[]'];
                return this;
            },
            checkFilterAtServer: function () {
                bodyParams.checkFilterAtServer = ['true'];
                return this;
            },
            setNotWithoutAdvertisingCampaign: function () {
                filter.push({
                    comparison: 'ne',
                    field: 'ac_name',
                    value: ['Посетители без рекламной кампании']
                });

                return this;
            },
            setCameFromReview: function () {
                filter.push({
                    field: 'id',
                    value: [938201, 83820],
                    comparison: 'eq'
                });

                return this;
            },
            setTags: function () {
                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['В обработке', 'Нецелевой контакт', undefined]
                });

                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['Не обработано', undefined]
                });

                filter.push(undefined);

                return this;
            },
            setSecondSetOfTags: function () {
                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['В обработке', 'Нецелевой контакт', undefined]
                });

                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['Не обработано', undefined]
                });

                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['В обработке', 'Нецелевой контакт', undefined]
                });

                filter.push(undefined);

                return this;
            },
            setThirdSetOfTags: function () {
                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['Нецелевой контакт', undefined]
                });

                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['Не обработано', undefined]
                });

                filter.push(undefined);

                return this;
            },
            setFourthSetOfTags: function () {
                filter.push({
                    comparison: 'overlap',
                    field: 'marks',
                    value: ['Не обработано', undefined]
                });

                filter.push(undefined);

                return this;
            },
            changeStartDate: function () {
                dateRange.start_date = '2019-08-13 00:00:00';
                bodyParams.start_date = [dateRange.start_date];
                return this;
            },
            send: function () {
                return request.
                    expectToHavePath('/analytics/call/get_grid_data/').
                    expectToHaveMethod('POST').
                    testBodyParam('filter', function (value) {
                        utils.expectToContain(JSON.parse(value[0]), filter);
                    }).
                    testBodyParam('date_range', function (value) {
                        utils.expectToContain(JSON.parse(value), dateRange);
                    }).
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith(response);
            }
        };
    };

    this.requestSecondDimention = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:second_dimensions/').
                    respondSuccessfullyWith({
                        success: true,
                        children: []
                    });
            }
        };
    };

    this.requestCallReferenceData = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/get_reference_data/').
                    expectQueryToContain({
                        site_id: '3825',
                        start_date: '2019-08-21 14:38:33',
                        end_date: '2019-08-26 23:59:59'
                    }).
                    testQueryParam('date_range', function (value) {
                        utils.expectToContain(JSON.parse(value), {
                            start_date: '2019-08-21 14:38:33',
                            end_date: '2019-08-26 23:59:59'
                        });
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            aggregation: [{
                                id: 'hour',
                                name: 'Час'
                            }],
                            mode: [{
                                default: true,
                                id: 'site',
                                name: 'По сайтам'
                            }],
                            parameter: [{
                                default: true,
                                id: 'day',
                                name: 'Звонки по дням'
                            }]
                        }
                    });
            },
        };
    };

    this.requestCallSettings = function () {
        var queryParams = {
            default: ''
        };

        var names = [
            'include_only_good_contacts',
            'include_only_first_contacts',
            'include_only_first_good_contacts',
            'include_only_through_first_good_contacts'
        ];

        var response = {
            include_only_first_contacts: false,
            include_only_first_good_contacts: false,
            include_only_good_contacts: false,
            include_only_through_first_good_contacts: false
        };

        return {
            setCallsColumns: function () {
                names = ['calls_columns'];
                response = {
                    calls_columns: 'ac_name,employee_name'
                };

                return this;
            },
            setNotDefault: function () {
                queryParams.default = 'false';
                return this;
            },
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/settings/read/').
                    expectQueryToContain(queryParams).
                    testQueryParam('names', function (value) {
                        utils.expectToContain(JSON.parse(value), names);
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: response 
                    });
            }
        };
    };

    this.requestCallColumns = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/call/columns/').
                    respondSuccessfullyWith({
                        success: true,
                        children: [{
                            mnemonic: '_group_main_columns',
                            text: 'Основные колонки',
                            children: [{
                                leaf: true,
                                name: 'employee_name',
                                text: 'Сотрудник'
                            }, {
                                leaf: true,
                                name: 'ac_name',
                                text: 'Рекламная кампания'
                            }]
                        }]
                    });
            }
        };
    };
    
    this.requestGoals = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:goals/').
                    respondSuccessfullyWith({
                        success: true,
                        children: [{
                            children: [],
                            engine: 'yandex.metrika',
                            text: 'Яндекс Метрика',
                            visible: false
                        }]
                    });
            }
        };
    };

    this.eventTrackingRequest = function () {
        var data = {
            category: 'report',
            action: 'before_load'    
        };

        return {
            setLoad: function () {
                data.action = 'load';
                return this;
            },
            setGridRendered: function () {
                data.action = 'grid_rendered';
                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().expectToHavePath(
                    '/system/event_tracker/track/'
                ).expectBodyToContain([data]).respondSuccessfullyWith({
                    success: true,
                    data: true
                });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.calendarButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.ul-daterangefield .x-form-trigger-ul');
    });

    this.augustThirteenthButton = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(Ext.fly(
            utils.findElementByTextContent(utils.getFloatingComponent(), 'Август 2019', '.x-datepicker-month')
        ).up('.x-datepicker').dom, '13', '.x-datepicker-date');
    });

    this.applyButton = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent().down('button[text="Применить"]');
    });

    this.reviewItemFilterDescription = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(Comagic.application.getViewport().el.dom,
            'Переход из отчёта Обзорный отчет', '.ul-property-name');
    });

    this.addFilterButton = testersFactory.createComponentTester(function () {
        return Comagic.application.findComponent('button[text="Добавить фильтр"]');
    });

    this.floatingForm = testersFactory.createFormTester(function () {
        return utils.getFloatingComponent();
    });

    this.chooseButton = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent().down('button[text="Выбрать"]');
    });

    this.applyFilterButton = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(document.querySelector('.cm-filter2panel-filters-container'), 'Применить',
            '.x-btn-inner');
    });

    this.setupColumnsButton = testersFactory.createComponentTester(function () {
        return Comagic.application.findComponent('button[text="Настроить столбцы"]');
    });

    this.advertisingCampaignExcludeButton = testersFactory.createDomElementTester(function () {
        return Ext.fly(
            utils.findElementByTextContent(utils.getFloatingComponent().el.dom, 'Рекламная кампания', '.token-text')
        ).up('.cm-token-body').down('.token-close').dom;
    });

    this.employeeNameExcludeButton = testersFactory.createDomElementTester(function () {
        return Ext.fly(
            utils.findElementByTextContent(utils.getFloatingComponent().el.dom, 'Сотрудник', '.token-text')
        ).up('.cm-token-body').down('.token-close').dom;
    });

    this.saveButton = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent().down('button[text="Сохранить"]');
    });

    this.advertisingCampaignFilterDescription = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(Comagic.application.getViewport().el.dom,
            'Рекламная кампания не равно Посетители без рекламной кампании', '.ul-property-container-inner');
    });

    this.button = function (text) {
        return testersFactory.createButtonTester(utils.getComponentByDomElement(
            utils.descendantOfBody().matchesSelector('.x-btn').textEquals(text).find()
        ));
    };

    this.filterContainer = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-filter2panel-filters-container');
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

    this.anchor = function (text) {
        return testersFactory.createAnchorTester(utils.descendantOfBody().matchesSelector('a').textEquals(text).find());
    };

    this.menuItem = function (text) {
        return testersFactory.createDomElementTester(utils.descendantOfBody().matchesSelector('.x-menu-item-text').
            textEquals(text).find());
    };

    this.conditionMenu = function (text) {
        return testersFactory.createDomElementTester(utils.descendantOfBody().
            matchesSelector('.ul-property-container').textEquals(text).find().querySelector('.ul-property-menu'));
    };

    this.cancelButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-filter2panel-controlpanel-btn-cancel');
    });

    this.saveFilterButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-filter2panel-controlpanel-btn-save');
    });

    this.exportBtn = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-btn-icon-export');
    });
}
