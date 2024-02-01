tests.requireClass('Comagic.base.store.Condition');
tests.requireClass('Comagic.services.ats.hook.controller.EditPage');

function ServicesAtsHook(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.hook.controller.EditPage');

    document.body.style.overflowY = 'auto';

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

    this.form = testersFactory.createFormTester(() => Comagic.getApplication().findComponent('panel'));

    this.conditionGroup = function () {
        return {
            atIndex: function (index) {
                const getFormComponent = () =>
                    utils.getComponentByDomElement(document.querySelectorAll('.cm-conditiongroup-panel')[index]);

                const tester = testersFactory.createFormTester(getFormComponent);

                tester.comboboxAt = index => testersFactory.createComboBoxTester(
                    getFormComponent().
                        down('services-ats-hook-condition').
                        query('field').
                        filter(function (field) {
                            return !field.hidden;
                        })[index],
                );

                return tester;
            },
            first: function () {
                return this.atIndex(0);
            }
        };
    };

    this.anchor = function (text) {
        return testersFactory.createAnchorTester(utils.descendantOfBody().matchesSelector('a').textEquals(text).find());
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
                            'comagic:ns:handler_default_message_template_v2.0': [{
                                event_version_id: 348924,
                                handler: 'http_request',
                                id: 357,
                                message_template: 'Уважаемый клиент CoMagic. Произошло событие "{{notification_name}}',
                                params: {
                                    method: 'GET',
                                },
                            }, {
                                event_version_id: 348925,
                                handler: 'http_request',
                                id: 358,
                                message_template: 'Comagic.ru средства на Вашем счете подходят к концу',
                                params: {
                                    method: 'GET',
                                },
                            }, {
                                event_version_id: 348926,
                                handler: 'http_request',
                                id: 359,
                                message_template: 'Уважаемый клиент CoMagic. Сработало событие "{{notification_name}}',
                                params: {
                                    method: 'GET',
                                },
                            }],
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
                                id: 'telegram_message',
                            }, {
                                id: 'sms_http_request',
                            }, {
                                id: 'send_mail',
                            }, {
                                id: 'http_request',
                            }],
                            'comagic:ns:event_v2.0': [{
                                id: 348924,
                                required_components: [],
                                name: 'Первое событие',
                                description: 'Описание первого события',
                            }, {
                                id: 348925,
                                required_components: [],
                                name: 'Некое событие',
                                description: 'Описание некого события',
                            }, {
                                description: null,
                                id: 348926,
                                mnemonic: 'unanswered_chats',
                                name: 'Неотвеченное сообщение',
                                required_components: [],
                            }],
                            'comagic:phone_book:contact': [{
                                aux_id: null,
                                id: 12931228,
                                name: 'Тодорова Сташа',
                            }],
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
                        handler: [{
                            notification_id: 26418,
                            name: 'HTTP',
                            app_id: 4735,
                            handler: 'http_request',
                            params: {
                                to: [
                                    {
                                        destination: 'http://requestbin.fullcontact.com/11uol2q1'
                                    }
                                ],
                                method: 'GET'
                            },
                            message_template: 'CoMagic средства на Вашем счете подходят к концу',
                            default_message_template: 'Comagic.ru средства на Вашем счете подходят к концу',
                            id: 28826
                        }],
                        notification: {
                            event_version_id: 348925
                        }
                    });
            }
        };
    };

    this.floatingComponent = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent();
    });

    this.conditionsRequest = function () {
        var params = {
            event_version_id: undefined
        };

        return {
            anotherEventVersionSpecified: function () {
                params.event_version_id = '348924';
                return this;
            },
            eventVersionSpecified: function () {
                params.event_version_id = '348925';
                return this;
            },
            thirdEventVersionSpecified: function () {
                params.event_version_id = '348926';
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
                        }, {
                            id: 42984,
                            text: 'Контакт',
                            data_type: 'number',
                            value_list_directory: 'comagic:phone_book:contact',
                            available_operators: [
                                '=',
                                'is_null',
                                'is_not_null',
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
