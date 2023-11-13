tests.requireClass('Comagic.base.store.Condition');
tests.requireClass('Comagic.services.ats.hook.controller.EditPage');

function ServicesAtsHook(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.hook.controller.EditPage');

    this.treeNode = function (text) {
        var domElement = utils.descendantOfBody().matchesSelector('.x-tree-node-text').textEquals(text).find(),
            tester = testersFactory.createDomElementTester(domElement);

        tester.expander = testersFactory.createDomElementTester(function () {
            return domElement.closest('.x-grid-cell-inner').querySelector('.x-tree-expander');
        });

        tester.expectToBeExpanded = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-row')).
                expectToHaveClass('x-grid-tree-node-expanded');
        };

        tester.expectToBeCollapsed = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-row')).
                expectNotToHaveClass('x-grid-tree-node-expanded');
        };

        tester.expectToBeSelected = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-item')).
                expectToHaveClass('x-grid-item-selected');
        };

        tester.expectNotToBeSelected = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-item')).
                expectNotToHaveClass('x-grid-item-selected');
        };

        tester.checkbox = testersFactory.createDomElementTester(function () {
            return domElement.closest('.x-grid-item').querySelector('.x-tree-checkbox');
        });

        return tester;
    };

    this.conditionGroup = function () {
        return {
            atIndex: function (index) {
                return testersFactory.createFormTester(
                    utils.getComponentByDomElement(document.querySelectorAll('.cm-conditiongroup-panel')[index])
                );
            },
            first: function () {
                return this.atIndex(0);
            }
        };
    };

    this.button = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                matchesSelector('.x-btn-inner').
                textEquals(text).
                find()
        );
    };

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.batchReloadRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:ns:condition_operator': [{
                                description: null,
                                id: '>',
                                is_value_required: true,
                                name: 'Больше'
                            }, {
                                description: null,
                                id: '<',
                                is_value_required: true,
                                name: 'Меньше'
                            }, {
                                description: null,
                                id: 'starts_with',
                                is_value_required: true,
                                name: 'Начинается с'
                            }, {
                                description: null,
                                id: 'ends_with',
                                is_value_required: true,
                                name: 'Заканчивается на'
                            }, {
                                description: null,
                                id: 'is_null',
                                is_value_required: false,
                                name: 'Пустое'
                            }, {
                                description: null,
                                id: 'is_not_null',
                                is_value_required: false,
                                name: 'Не пустое'
                            }, {
                                description: 'Множество значений в событии точно соответствует множеству выбранных ' +
                                    'значений / Значение в событии точно соответствует заданному значению',
                                id: '=',
                                is_value_required: true,
                                name: 'Точно соответствует'
                            }, {
                                description: 'Множество значений в событии содержит все выбранные значения / ' +
                                    'Значение в событии содержит заданную строку',
                                id: 'in',
                                is_value_required: true,
                                name: 'Содержит'
                            }, {
                                description: 'Множество значений в событии включает хотя бы одно выбранное значение',
                                id: 'intersect',
                                is_value_required: true,
                                name: 'Включает'
                            }, {
                                description: 'Множество значений в событии целиком содержится во множестве выбранных ' +
                                    'значений',
                                id: 'sub',
                                is_value_required: true,
                                name: 'Содержится в'
                            }],
                            'comagic:_tree:segments_by_sites': [{
                                id: 51425,
                                leaf: false,
                                name: 'somesite.com',
                                data: [{
                                    data: [],
                                    id: 86928,
                                    leaf: true,
                                    name: 'Первый сегмент'
                                }, {
                                    data: [],
                                    id: 96817,
                                    leaf: true,
                                    name: 'Второй сегмент'
                                }]
                            }, {
                                id: 2757,
                                leaf: false,
                                name: 'othersite.com',
                                data: [{
                                    data: [],
                                    id: 72857,
                                    leaf: true,
                                    name: 'Третий сегмент'
                                }, {
                                    data: [],
                                    id: 6738,
                                    leaf: true,
                                    name: 'Четвертый сегмент'
                                }]
                            }],
                            'comagic:public:true_false': [],
                            'comagic:public:number_capacity_with_common': [],
                            'comagic:ns:event_param_v2.0': [],
                            'comagic:ns:handler': [{
                                id: 'sms_http_request',
                                required_components: []
                            }, {
                                id: 'send_mail',
                                required_components: []
                            }, {
                                id: 'http_request',
                                required_components: []
                            }]
                        }
                    });
            }
        };
    };

    this.hookRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/hook/read/hook/').
                    expectToHaveMethod('GET').
                    expectQueryToContain({
                        id: '104561'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        notification: {
                            event_version_id: 348925
                        }
                    });
            }
        };
    };

    this.conditionsRequest = function () {
        var params = {
            event_version_id: undefined
        };

        return {
            setEventVersion: function () {
                params.event_version_id = '348925';
                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:condition/').
                    expectQueryToContain(params).
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        children: [{
                            id: 42983,
                            text: 'Название сценария ВАТС',
                            available_operators: [
                                '=',
                                'in',
                                'starts_with',
                                'ends_with',
                                'is_null',
                                'is_not_null'
                            ],
                            leaf: true
                        }]
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
