tests.requireClass('Comagic.base.store.Condition');
tests.requireClass('Comagic.services.ats.hook.controller.EditPage');
tests.requireClass('Comagic.services.ats.hook.store.Records');
tests.requireClass('Comagic.services.ats.hook.controller.Page');

function ServicesAtsHookList(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.hook.controller.Page'),
        editingController = Comagic.getApplication().getController('Comagic.services.ats.hook.controller.EditPage');

    document.body.style.overflowY = 'auto';

    this.openPage = function (data) {
        controller.init();

        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.openEditingPage = function (data) {
        editingController.init();

        editingController.actionIndex({
            siteId: 1234
        }, data);
    };

    const eventParams = [{
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
    }];

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
                            'comagic:ns:event_param_v2.0': eventParams,
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
                            'comagic:_tree:employee_short_phones': [{
                                id: '32',
                                leaf: true,
                                name: '32',
                            }],
                        }
                    });
            }
        };
    };

    this.employeeShortPhonesRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:_tree:employee_short_phones/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: '32',
                            leaf: true,
                            name: '32',
                        }],
                    });
            }
        };
    };

    this.handlerScheduleRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:ns:handler_schedule/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 626,
                            name: 'Будни и выходные',
                        }],
                    });
            }
        };
    };

    this.eventParamsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:ns:event_param_v2.0/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: eventParams,
                    });
            }
        };
    };

    this.hooksRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/records/read/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        total: 1,
                        data: [{
                            worker_type: 'common',
                            metadata: null,
                            is_active: true,
                            id: 104561,
                            name: 'HTTP',
                        }],
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

    this.button = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                matchesSelector('.x-btn-inner').
                textEquals(text).
                find()
        );
    };

    this.grid = testersFactory.createGridTester(function () {
        return Comagic.getApplication().findComponent('grid');
    });

    this.floatingComponent = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent();
    });

    this.destroy = function() {
        controller.destroy();
    };
}
