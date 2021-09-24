tests.requireClass('Comagic.services.autocalls.autobackcall.controller.Page');
tests.requireClass('Comagic.services.autocalls.autobackcall.store.Rules');

function ServicesAutocallsAutobackcall(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.autocalls.autobackcall.controller.Page');

    this.actionIndex = function () {
        controller.init();
        controller.actionIndex();
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.editForm = testersFactory.createFormTester(function () {
        return utils.getComponentByDomElement(utils.getComponentByDomElement(utils.getVisibleSilently(
            document.querySelectorAll(
                '.x-window-body > .x-autocontainer-outerCt > .x-autocontainer-innerCt > .x-panel'
            )
        )));
    });

    this.button = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().textEquals(text).matchesSelector('.x-btn-inner').find()
        );
    };

    this.minWaitDurationCheckbox = function () {
        return testersFactory.createCheckboxTester(utils.getComponentByDomElement(
            utils.descendantOfBody().
                textEquals('Не перезванивать, если абонент ожидал ответа менее').
                matchesSelector('.x-form-item-label-inner').
                find().
                closest('.x-container').
                querySelector('.x-form-type-checkbox')
        ));
    };

    this.editButton = testersFactory.createDomElementTester('.ul-btn-usual-icon-cls-edit');

    this.rulesListItem = (function () {
        var getRulesListItems = function () {
            return document.querySelectorAll('.cm-draggable-item');
        };

        var tester = testersFactory.createDomElementTester(function () {
            return utils.getVisibleSilently(getRulesListItems());
        });

        tester.atIndex = function (index) {
            function getRulesListItem () {
                return getRulesListItems()[index] || new JsTester_NoElement();
            }

            var tester = testersFactory.createDomElementTester(getRulesListItem);

            function atIndex (index) {
                return testersFactory.createDomElementTester(function () {
                    return getRulesListItem().querySelectorAll(
                        '.x-panel-body .x-container .x-container'
                    )[index];
                });
            }

            tester.informationBlock = {
                atIndex: atIndex,
                first: atIndex(0)
            };

            return tester;
        };

        tester.first = tester.atIndex(0);
        return tester;
    })();

    this.autoBackCallCreatingRequest = function () {
        var response = {
            success: true
        };

        var bodyParams = {
            name: 'Правило 2',
            is_active: true,
            priority: 0,
            event_filter_type: 'some_filter',
            event_filter_params: [],
            task_schedule_id: null,
            schedule_id: null,
            attempts: ['0', '5', '15'],
            processing_method: 'some_processing_method',
            processing_method_params: [],
            min_wait_duration: 15,
            max_parallel_calls_count: 1,
            operator_playlist: null,
            number_capacity_id: 528272
        };

        return {
            noMinWaitDuration: function () {
                bodyParams.min_wait_duration = null;
                return this;
            },
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/autocalls__autobackcall/create/').
                    expectBodyToContain(bodyParams);

                return {
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.autoBackCallRequest = function () {
        var response = {
            success: true,
            data: [{
                name: 'Правило 1',
                is_active: true,
                min_wait_duration: 15,
                max_parallel_calls_count: 3,
                event_filter_type: 'some_filter',
                processing_method: 'some_processing_method',
                attempts: ['0', '5', '15'],
                number_capacity_id: 528272
            }]
        };

        function addMethods (me) {
            me.noMinWaitDuration = function () {
                response.data[0].min_wait_duration = null;
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/autocalls__autobackcall/read/');

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };
    
    this.masterBackCallActivityRequest = function () {
        var response = {
            success: true,
            data: [] 
        };

        return {
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/autocalls__autobackcall/get_master_back_call_is_active/');

                return {
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.batchReloadRequest = function () {
        var response = {
            success: true,
            data: {
                'comagic:_tree:scenario_actions': [{
                    data: [{
                        id: 623393,
                        leaf: true,
                        name: 'Переадресация 1'
                    }],
                    id: 's4863',
                    name: 'Перенаправление на 89265564454'
                }],
                'comagic:va:scenario': [{
                    aux_id: true,
                    id: 4863,
                    name: 'Перенаправление на 89265564454'
                }],
                'comagic:auto_call:event_filter_type': [{
                    id: 'some_filter',
                    name: 'Некий фильтр',
                    components: ['auto_back_call_by_lost_call']
                }, {
                    id: 'scenario',
                    name: 'Сценарий',
                    components: ['auto_back_call_by_lost_call'],
                    aux_id2: [{
                        event_filter_type: 'scenario',
                        id: 'scenario_id',
                        is_required: true,
                        name: 'Сценарий ВАТС',
                        priority: 1,
                        value_list_directory: 'comagic:va:scenario'
                    }, {
                        event_filter_type: 'scenario',
                        id: 'action_id',
                        is_required: false,
                        name: 'Операция сценария',
                        priority: 2,
                        value_list_directory: 'comagic:_tree:scenario_actions'
                    }]
                }],
                'comagic:auto_call:processing_method': [{
                    id: 'some_processing_method',
                    name: 'Некий метод обработки',
                    components: ['auto_back_call_by_lost_call']
                }],
                'billing:public:number_capacity': [{
                    id: 528272,
                    name: '79161234567'
                }]
            } 
        };

        return {
            expectToBeSent: function () {
                return {
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith(response);
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };
}
