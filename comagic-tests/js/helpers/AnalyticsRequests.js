tests.requireClass('Comagic.analytics.requests.controller.Page');

function AnalyticsRequests({
    requestsManager,
    testersFactory,
    utils,
}) {
    var controller = Comagic.getApplication().getController('Comagic.analytics.requests.controller.Page');

    this.actionIndex = function () {
        controller.init();

        controller.actionIndex({
            siteId: 3825,
            dateRange: {
                startDate: Ext.Date.add(new Date(1566819513815), Ext.Date.DAY, -5),
                endDate: new Date(1566819513815)
            }
        });

        document.querySelector('.cm-basepage').style.overflow = 'auto';
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.requestGoals = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
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
            },
            send: function () {
                this.receiveResponse();
            }
        };
    };

    this.goalsRequest = this.requestGoals;

    this.requestsSettingsRequest = function () {
        const queryParams = {
            default: ''
        };

        let names = [
            'include_only_good_contacts',
            'include_only_first_contacts',
            'include_only_first_good_contacts',
            'include_only_through_first_good_contacts'
        ];

        let response = {
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
            receiveResponse: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/requests/settings/read/').
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

    this.requestsReferenceDataRequest = function () {
        return {
            receiveResponse: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/requests/get_reference_data/').
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

    this.secondDimentionRequest = function () {
        return {
            receiveResponse: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:second_dimensions/').
                    respondSuccessfullyWith({
                        success: true,
                        children: []
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

    this.gridDataRequest = function () {
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
                is_communication: true,
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
            }, {
                id: 938203,
                employee_name: 'Сидоров Сидор Сидорович',
                ac_name: 'Посетители без рекламной кампании',
                marks: [],
                numa: '79451234569',
                is_auto_sale: true,
                component: 'Омниканальный виджет',
                component_id: 'omni_widget',
                direction: 'in',
                crm_contact_name: 'Сидоровский Сидорий Сидориевич',
                crm_contact_link: 'https://comaigc.amocrm.ru/contacts/detail/42574737'
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
            receiveResponse: function () {
                return request.
                    expectToHavePath('/analytics/requests/get_grid_data/').
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

    this.requestsFiltersRequest = function () {
        return {
            receiveResponse: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/requests/filters/read/').
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

    this.requestsChartDataRequest = function () {
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
            receiveResponse: function () {
                return request.
                    expectToHavePath('/analytics/requests/get_chart_data/').
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
}
