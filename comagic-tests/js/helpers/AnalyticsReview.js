tests.requireClass('Comagic.analytics.call.controller.Page');
tests.requireClass('Comagic.analytics.review.controller.Page');

function AnalyticsReview(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.analytics.review.controller.Page');

    this.requestWarnings = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/review/warnings/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            ac_with_failure_access: [],
                            ac_with_failure_dynamical_calltracking: []
                        }
                    });
            }
        };
    };
    this.requestReview = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/analytics/review/review_grid/read/').
                    testQueryParam('date_range', function (value) {
                        utils.expectToContain(JSON.parse(value), {
                            start_date: '2019-08-21 14:38:33',
                            end_date: '2019-08-26 23:59:59'
                        });
                    }).
                    expectQueryToContain({
                        start_date: '2019-08-21 14:38:33',
                        end_date: '2019-08-26 23:59:59'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            site_id: 5056,
                            title: 'www.rian.ru',
                            sessions_count: 2832,
                            calls_count: 902,
                            ac_id: 9203,
                            parameter_mnemonic: 'ac',
                            total_calls_ids: [9382]
                        }],
                        metaData: {
                            fields: [{
                                mnemonic: '_review_title',
                                name: 'title',
                                sortable: false,
                                text: 'Сайт',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                }
                            }, {
                                name: 'sessions_count',
                                sortable: false,
                                text: 'Посещения',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                },
                                width: 110
                            }, {
                                name: 'calls_count',
                                requirements: ['call_tracking', 'va'],
                                sortable: false,
                                text: 'Звонки',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                },
                                width: 93
                            }, {
                                hidden: true,
                                name: 'parameter_mnemonic',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                }
                            }, {
                                hidden: true,
                                name: 'ac_id',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                }
                            }, {
                                hidden: true,
                                name: 'site_id',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                }
                            }, {
                                hidden: true,
                                name: 'total_calls_ids',
                                usage: {
                                    __usage__: true,
                                    in: ['grid', 'filters', 'settings', 'export', 'store', 'stored_filters']
                                }
                            }]
                        }
                    });
            }
        };
    };
    this.actionIndex = function () {
        controller.init();

        controller.actionIndex({
            siteId: 3825,
            dateRange: {
                startDate: Ext.Date.add(new Date(1566819513815), Ext.Date.DAY, -5),
                endDate: new Date(1566819513815) 
            }
        });
    };

    this.reviewGrid = testersFactory.createGridTester(function () {
        return Comagic.application.findComponent('gridcolumn[text="Сайт"]').up('grid');
    });
}
