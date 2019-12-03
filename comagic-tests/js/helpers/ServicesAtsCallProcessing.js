tests.requireClass('Comagic.services.ats.callprocessing.store.Records');
tests.requireClass('Comagic.services.ats.callprocessing.controller.Page');

function ServicesAtsCallProcessing(requestsManager, testersFactory, utils) {
    this.batchReloadRequest = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        data: {
                            'comagic:va:scenario': [{
                                aux_id: true,
                                id: 4863,
                                name: 'Перенаправление на 89265564454'
                            }],
                            'comagic:calendar:schedule': [{
                                aux_id: true,
                                id: -1,
                                name: 'Не задан'
                            }],
                            'comagic:phone_book:numa_list': [{
                                aux_id: null,
                                aux_id2: null,
                                aux_id3: true,
                                id: -1,
                                name: 'Для всех номеров'
                            }],
                            'comagic:analytics:site': [{
                                aux_id: '79265564454',
                                aux_id2: '2014-11-25 19:05:23+03',
                                aux_id3: true,
                                aux_id4: true,
                                aux_id5: [true, true, true, true],
                                default_scenario: null,
                                id: 5056,
                                is_widget_link_enabled: false,
                                name: 'www.rian.ru',
                                widget_link_text: null,
                                widget_link_url: null
                            }],
                            'comagic:analytics:ac': [{
                                aux_id: 5473,
                                id: 14014,
                                name: 'Яндекс.Директ [выключена]'
                            }]
                        },
                        success: true
                    });
            }
        };
    };

    this.requestAtsCallProcessing = function () {
        var queryParams = {
            filter: undefined
        };

        return {
            filterByNumber: function () {
                queryParams.filter = '[{"property":"fullsearch_text","value":"79161234567"}]';
                return this;
            },
            doNotFilterByScenario: function () {
                queryParams.filter = '[{"property":"fullsearch_text","value":""}]';
                return this;
            },
            filterByAbsenceOfScenario: function () {
                queryParams.filter =
                    '[{"property":"scenario_id","value":"empty"},{"property":"fullsearch_text","value":""}]';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__callprocessing/records/read/').
                    expectQueryToContain(queryParams).
                    respondSuccessfullyWith({
                        data: [{
                            ac_name_list: [],
                            cb_call_processing_rules: [],
                            cnt: 54,
                            co_call_processing_rules: [],
                            id: 290397,
                            numb: '13234547575',
                            number_capacity_id: 290397,
                            prefix: '1323',
                            site_domain_list: [],
                            va_call_processing_rules: [{
                                call_processing_rule_id: 351417,
                                is_active: true,
                                numa_list_id: null,
                                numa_list_name: null,
                                scenario_id: 160223,
                                scenario_name: 'TestZakharov',
                                schedule_id: null,
                                schedule_name: null
                            }]
                        }],
                        success: true
                    });
            }
        };
    };

    Comagic.Directory.load();
    this.batchReloadRequest().send();

    var controller = Comagic.getApplication().
        getController('Comagic.services.ats.callprocessing.controller.Page');

    controller.init();
    controller.actionIndex({
        siteId: 1234
    });

    var filtersToolbar = Comagic.getApplication().findComponent('combobox[fieldLabel="Сценарий"]').up('container').
        up('container');
    
    this.addVirtualNumberButton = testersFactory.createButtonTester(filtersToolbar.down(
        'button[text="Добавить виртуальный номер"]'
    ));

    this.filtersToolbar = testersFactory.createFormTester(filtersToolbar);

    this.destroy = function() {
        controller.destroy();
    };
}
