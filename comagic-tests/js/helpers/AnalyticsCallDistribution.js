tests.requireClass('Comagic.analytics.calldistribution.controller.Page');

function AnalyticsCallDistribution(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.analytics.calldistribution.controller.Page');

    controller.init();
    controller.actionIndex({
        siteId: 3825,
        dateRange: {
            startDate: Ext.Date.add(new Date(1566819513815), Ext.Date.DAY, -5),
            endDate: new Date(1566819513815)
        }
    });

    this.requestCallDistributionSettingsUpdate = function () {
        var bodyParams = {
            include_internal: undefined,
            include_external: undefined
        };

        return {
            setIncludeInternalFalse: function () {
                bodyParams.include_internal = ['false'];
                return this;
            },
            setIncludeExternalFalse: function () {
                bodyParams.include_external = ['false'];
                return this;
            },
            setIncludeInternalTrue: function () {
                bodyParams.include_internal = ['true'];
                return this;
            },
            setIncludeExternalTrue: function () {
                bodyParams.include_external = ['true'];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/calldistribution/settings/update/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: ''
                    });
            }
        };
    };

    this.requestCallDistributionFilters = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/calldistribution/filters/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            contains_sale: false,
                            filters: [{
                                field: 'employee_name',
                                type: 'list',
                                rawValue: ['o'],
                                value: ['o'],
                                comparison: 'ilike'
                            }],
                            name: 'test'
                        }]
                    });
            }
        };
    };

    this.requestCallDistributionGridData = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/calldistribution/get_grid_data/').
                    expectQueryToContain({
                        mode: 'in',
                        checkFilterAtServer: 'false',
                        reportType: 'call_distribution',
                        start_date: '2019-08-21 14:38:33',
                        end_date: '2019-08-26 23:59:59',
                        site_id: '3825'
                    }).
                    testQueryParam('date_range', function (value) {
                        utils.expectToContain(Ext.JSON.decode(value), {
                            start_date: '2019-08-21 14:38:33',
                            end_date: '2019-08-26 23:59:59'
                        });
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            numb: '74951234567'
                        }],
                        summaryData: {
                            total_count: 1,
                            total_records: 1
                        },
                        metaData: {
                            total: 1,
                            grid: [{
                                description: 'Виртуальный номер',
                                filterType: 'list',
                                isDimension: true,
                                listFilterParams: {
                                    directory_name: 'comagic:public:number_capacity_with_common',
                                    site_id: null
                                },
                                name: 'numb',
                                text: 'Виртуальный номер',
                                usage: {
                                    __usage__: true,
                                    in: [
                                        'grid',
                                        'filters',
                                        'settings',
                                        'export',
                                        'store',
                                        'stored_filters'
                                    ]
                                },
                                valueElData: 'directory'
                            }]
                        }
                    });
            }
        };
    };

    this.requestSecondDimensions = function () {
        var children = [],
            request = requestsManager.recentRequest();

        return {
            setCallDistributionReportType: function () {
                request.expectQueryToContain({
                    reportType: 'call_distribution'
                });

                children.push({
                    help_text: null,
                    id: 'numb',
                    leaf: true,
                    text: 'Виртуальный номер'
                });

                return this;
            },
            send: function () {
                request.
                    expectToHavePath('/directory_tree/comagic:second_dimensions/').
                    respondSuccessfullyWith({
                        success: true,
                        children: children 
                    });
            }
        };
    };

    this.requestCallDistributionReferenceData = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/calldistribution/get_reference_data/').
                    expectQueryToContain({
                        start_date: '2019-08-21 14:38:33',
                        end_date: '2019-08-26 23:59:59',
                        site_id: '3825'
                    }).
                    testQueryParam('date_range', function (value) {
                        utils.expectToContain(Ext.JSON.decode(value), {
                            start_date: '2019-08-21 14:38:33',
                            end_date: '2019-08-26 23:59:59'
                        });
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            mode: [{
                                default: true,
                                id: 'in',
                                name: 'Входящие звонки'
                            }, {
                                id: 'out',
                                name: 'Исходящие звонки'
                            }]
                        }
                    });
            }
        };
    };

    this.requestCallDistributionSettings = function () {
        var data = {
            include_internal: false,
            include_external: false
        };

        return {
            includeInternal: function () {
                data.include_internal = true;
                return this;
            },
            includeExternal: function () {
                data.include_external = true;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/analytics/calldistribution/settings/read/').
                    testQueryParam('names', function (value) {
                        utils.expectToContain(Ext.JSON.decode(value), ['include_internal', 'include_external']);
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: data
                    });
            }
        };
    };

    this.internalCallsButton = testersFactory.createComponentTester(function () {
        return Comagic.application.findComponent('button[text="Внутренние звонки"]');
    });

    this.externalCallsButton = testersFactory.createComponentTester(function () {
        return Comagic.application.findComponent('button[text="Внешние звонки"]');
    });

    this.destroy = function () {
        controller.destroy();
    };
}
