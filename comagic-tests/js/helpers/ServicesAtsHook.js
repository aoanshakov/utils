tests.requireClass('Comagic.base.store.Condition');
tests.requireClass('Comagic.services.ats.hook.controller.EditPage');

tests.requireResponse('batch_reload_59171_1');
tests.requireResponse('batch_reload_59171_2');
tests.requireResponse('directory_tree_comagic_condition_59171');
tests.requireResponse('directory_tree_comagic_condition_59171_12');
tests.requireResponse('hook_59171');

function ServicesAtsHook(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        responses = args.responses,
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

    function field (label, selector) {
        const field = utils.descendantOfBody().
            matchesSelector('.x-form-item-label-inner').
            textEquals(label).
            find().
            closest('.x-field');

        return selector ? field.querySelector(selector) : field;
    }

    this.switchbox = function (label) {
        return testersFactory.createDomElementTester(field(label, 'a.x-form-switchbox'));
    };

    this.button = function (text) {
        const getElement = () =>  utils.descendantOfBody().
            matchesSelector('.x-btn-inner').
            textEquals(text).
            find();

        const button = testersFactory.createDomElementTester(() => getElement().closest('.x-btn')),
            tester = testersFactory.createDomElementTester(getElement);

        tester.expectToBeDisabled = () => button.expectToHaveClass('x-btn-disabled');
        tester.expectToBeEnabled = () => button.expectNotToHaveClass('x-btn-disabled');

        return tester;
    };

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.batchReloadRequest = function () {
        let data = {
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
            'comagic:ns:event_param_v2.0': [{
                aux_id: 7,
                aux_id2: 'visitor_email',
                data_example: 'example@example.ru',
                data_type: 'string',
                description: 'Электронный адрес посетителя',
                id: 1,
                name: 'E-mail адрес посетителя',
                required_components: []
            }, {
                aux_id: 98,
                aux_id2: 'visitor_email',
                data_example: 'example@example.ru',
                data_type: 'string',
                description: 'Электронный адрес посетителя',
                id: 2,
                name: 'E-mail адрес посетителя',
                required_components: []
            }, {
                aux_id: 102,
                aux_id2: 'visitor_email',
                data_example: 'example@example.ru',
                data_type: 'string',
                description: 'Электронный адрес посетителя',
                id: 3,
                name: 'E-mail адрес посетителя',
                required_components: []
            }, {
                aux_id: 348925,
                aux_id2: 'first_talked_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email первого сотрудника, который разговаривал с абонентом в рамках ' +
                    'конкретного вызова',
                id: 4,
                name: 'Email первого разговаривавшего сотрудника',
                required_components: []
            }, {
                aux_id: 1,
                aux_id2: 'first_talked_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email первого сотрудника, который разговаривал с абонентом в рамках ' +
                    'конкретного вызова',
                id: 5,
                name: 'Email первого разговаривавшего сотрудника',
                required_components: []
            }, {
                aux_id: 348925,
                aux_id2: 'last_talked_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email последнего сотрудника, который разговаривал с абонентом в рамках ' +
                    'конкретного вызова',
                id: 6,
                name: 'Email последнего разговаривавшего сотрудника',
                required_components: []
            }, {
                aux_id: 1,
                aux_id2: 'last_talked_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email последнего сотрудника, который разговаривал с абонентом в рамках ' +
                    'конкретного вызова',
                id: 7,
                name: 'Email последнего разговаривавшего сотрудника',
                required_components: []
            }, {
                aux_id: 1,
                aux_id2: 'employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email сотрудника',
                id: 8,
                name: 'Email сотрудника',
                required_components: []
            }, {
                aux_id: 348925,
                aux_id2: 'employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email сотрудника',
                id: 9,
                name: 'Email сотрудника',
                required_components: []
            }, {
                aux_id: 348925,
                aux_id2: 'first_answered_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email первого сотрудника, ответившего на звонок в рамках конкретного ' +
                    'вызова',
                id: 10,
                name: 'Email сотрудника, который принял вызов первым',
                required_components: []
            }, {
                aux_id: 12,
                aux_id2: 'first_answered_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email первого сотрудника, ответившего на звонок в рамках конкретного ' +
                    'вызова',
                id: 11,
                name: 'Email сотрудника, который принял вызов первым',
                required_components: []
            }, {
                aux_id: 1,
                aux_id2: 'first_answered_employee_email',
                data_example: 'john-doe@example.com',
                data_type: 'string',
                description: 'Email первого сотрудника, ответившего на звонок в рамках конкретного ' +
                    'вызова',
                id: 12,
                name: 'Email сотрудника, который принял вызов первым',
                required_components: []
            }],
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
        };

        return {
            app59171() {
                data = {
                    ...responses['batch_reload_59171_1'].data,
                    ...responses['batch_reload_59171_2'].data,
                };

                return this;
            },

            receiveResponse: function () {
                console.log('DIR', data);

                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data,
                    });
            }
        };
    };

    this.telegramChatIdValidationRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/validate_telegram_chat_id/').
                    expectToHaveMethod('GET').
                    expectQueryToContain({
                        value: '154463486',
                    }).
                    respondSuccessfullyWith([]);
            }
        };
    };

    this.hookRequest = function () {
        let response = {
            success: true,
            handler: [/*{
                notification_id: 104561,
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
            },*/ {
                notification_id: 104561,
                name: 'Telegram',
                app_id: 4735,
                handler: 'telegram_message',
                params: {
                    to: [
                        {
                            schedule_id: 38235948,
                            destination: '154463486'
                        }
                    ]
                },
                message_template: 'Пропущенный звонок от {{calling_phone_number}} на ваш номер {{called_phone_number}} в {{finish_time_localized}}',
                default_message_template: 'Пропущенный звонок от {{calling_phone_number}} на ваш номер {{called_phone_number}} в {{finish_time_localized}}',
                id: 670601
            }],
            notification: {
                event_version_id: 348925,
                worker_type: 'common',
                name: 'потерянный звонок',
                event_name: 'Потерянный звонок',
                event_mnemonic: 'lost_call_session',
                is_active: false,
                app_id: 4735,
                is_system: false,
                schedule_id: null,
                is_removed: false,
                notification_priority: 'normal',
                creation_date: '2024-06-30T14:21:19+03:00',
                type: 'user',
                id: 104561,
                metadata: null
            }
        };

        return {
            app59171() {
                response = responses['hook_59171'];
                return this;
            },

            singleConditionGroup() {
                response.condition_group[0].condition[0].value = [response.condition_group[0].condition[0].value[0]];
                response.condition_group = [response.condition_group[0]];

                return this;
            },

            noConditionGroup() {
                response.condition_group = [];
                return this;
            },

            expectToBeSent() {
                const request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/hook/read/hook/').
                    expectToHaveMethod('GET').
                    expectQueryToContain({
                        id: '104561'
                    });

                return {
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    },
                };
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        };
    };

    this.hookSavingRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/hook/save/hook/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        notification: {
                            name: 'Некое уведомление',
                            event_version_id: 348924,
                            is_active: false,
                        },
                        condition_group: [{
                            condition: [{
                                is_negative: false,
                                param_id: 42984,
                                condition_operator: '=',
                                value: 12931228,
                            }],
                        }],
                    }).

                    respondSuccessfullyWith({ success: true });
            }
        };
    };

    this.floatingComponent = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent();
    });

    this.conditionsRequest = function () {
        let app59171 = false;

        var params = {
            event_version_id: undefined
        };

        const addModifiers = me => {
            me.app59171 = () => {
                app59171 = true;
                return me;
            };

            me.anotherEventVersionSpecified = function () {
                params.event_version_id = '348924';
                return me;
            };

            me.eventVersionSpecified = function () {
                params.event_version_id = '348925';
                return me;
            };

            me.thirdEventVersionSpecified = function () {
                params.event_version_id = '348926';
                return me;
            };

            me.fourthEventVersionSpecified = function () {
                params.event_version_id = '12';
                return me;
            };

            return me;
        };

        return addModifiers({
            expectToBeSent: function () {
                const request = requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:condition/').
                    expectQueryToContain(params).
                    expectToHaveMethod('GET');

                return addModifiers({
                    receiveResponse: () => {
                        const response = app59171
                            ? params.event_version_id
                                ? responses['directory_tree_comagic_condition_59171_12']
                                : responses['directory_tree_comagic_condition_59171']
                            : {
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
                                    is_multiselect: false,
                                    available_operators: [
                                        '=',
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    leaf: true
                                }]
                            };

                        request.respondSuccessfullyWith(response);
                    },
                });
            },

            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    this.destroy = function() {
        controller.destroy();
    };
}
