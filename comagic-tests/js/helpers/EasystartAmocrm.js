function EasystartAmocrm(requestsManager, testersFactory, utils) {
    var me = this;

    function dateFormats (date) {
        return function (format) {
            return Ext.Date.format(date, format);
        };
    }

    this.currentDate = dateFormats(new Date());
    this.nextDay = dateFormats(Ext.Date.add(new Date(), Ext.Date.DAY, 1));
    this.dayAfterTomorrow = dateFormats(Ext.Date.add(new Date(), Ext.Date.DAY, 2));
    this.previousDay = dateFormats(Ext.Date.subtract(new Date(), Ext.Date.DAY, 1));

    easyStartApplicationState = {
        data: {
            number: 79031234567,
            ext_id: 2,
            email: 'chigrakov@example.com',
            name: 'Марк Чиграков Брониславович'
        },
        success: true,
        partner: 'amocrm'
    };

    Ext.define('EasyStart.test.amocrm.Utils', {
        override: 'EasyStart.amocrm.Utils',
        reloadPage: Ext.emptyFn,
    });

    this.requestSalesFunnelStatus = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:sales_funnel_status/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 7185,
                            name: 'Некий статус'
                        }, {
                            id: 1958,
                            name: 'Другой статус'
                        }, {
                            id: 9174,
                            name: 'Еще один статус'
                        }, {
                            id: 8195,
                            name: 'И еще один статус'
                        }]
                    });
            }
        };
    };
    this.requestUserFields = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:_tree:amocrm_user_fields/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            id: 2845,
                            name: 'Какое-то поле',
                            leaf: false,
                            data: [{
                                id: 2149,
                                name: 'Другое поле',
                                leaf: true,
                                data: []
                            }]
                        }
                    });
            }
        };
    };
    this.requestSalesFunnel = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:sales_funnel/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 4719,
                            name: 'Некая воронка'
                        }, {
                            id: 7271,
                            name: 'Другая воронка'
                        }, {
                            id: 8175,
                            name: 'Еще одна воронка'
                        }, {
                            id: 7186,
                            name: 'И еще одна воронка'
                        }]
                    });
            }
        };
    };
    this.requestOrderCallback = function () {
        return {
            send: (function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/order_callback/').
                    expectBodyToContain({
                        number: 74951234567,
                        date: this.nextDay('Y-m-d'),
                        since: '13:54',
                        to: '20:05'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        result: {}
                    });
            }).bind(this) 
        };
    };
    this.requestAnswers = function () {
        var response = {
            success: true,
            result: []
        };

        var respond = function (request) {
            request.respondSuccessfullyWith(response);
        };

        return {
            setFatalError: function () {
                respond = function (request) {
                    request.respondForbidden();
                };

                return this;
            },
            setError: function () {
                response.success = false;
                response.error = 'Что-то пошло не так';
                delete(response.result);
                return this;
            },
            addFirstUnsuccessfulCall: function () {
                response.result.push({
                    call_date: '2019-02-12 12:25:03',
                    is_success: false
                });

                return this;
            },
            addFirstUser: function () {
                response.result.push({
                    ext_id: '9',
                    name: 'Доминика',
                    last_name: 'Языкина',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d3e/' +
                        'd3e115837e337eb8e4f6482b86ac336b/female1.jpeg',
                    call_date: '2019-02-12 12:25:03',
                    is_success: true
                });

                return this;
            },
            addSecondUser: function () {
                response.result.push({
                    ext_id: '1',
                    name: 'Артур',
                    last_name: 'Турфанов',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/96e/' +
                        '96eeee18f1cd372f340cfa8a55c50a5a/male3.jpeg',
                    call_date: '2019-02-12 12:26:05',
                    is_success: true
                });

                return this;
            },
            send: function () {
                respond(requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/easy_start_calls/'));
            }
        };
    };
    this.requestCallState = function () {
        var result = 'new';

        return {
            setProcessed: function () {
                result = 'processed';
                return this;
            },
            setError: function () {
                result = 'error';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectBodyToContain({
                        task_id: 83921
                    }).
                    expectToHavePath('/easystart/amocrm/test_call_task_state/').
                    respondSuccessfullyWith({
                        success: true,
                        result: result
                    });
            }
        };
    };
    this.requestTestCall = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/test_call/').
                    respondSuccessfullyWith({
                        success: true,
                        result: 83921
                    });
            }
        };
    };
    this.requestIntegrationConfig = function () {
        var bodyParams = {
            in_call_responsible_ext_id: 3,
            success_call_tags: ['Тэг номер один', 'Тэг номер два'],
            lost_call_tags: ['Тэг номер три', 'Тэг номер четыре']
        };

        return {
            changeTags: function () {
                bodyParams.success_call_tags = ['Тэг номер два', 'Тэг номер четыре', 'Еще один тег'];
                bodyParams.lost_call_tags = ['Тэг номер три', '{{virtual_phone_number}}', 'Какой-то тег'];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/integration_config/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: {
                            next_step_params: {},
                            next_step: 'test_call'
                        }
                    });
            },
        };
    };
    this.requestCallProcessingConfig = function () {
        var bodyParams = {
            employees: [{
                ext_id: 9,
                forwarding_timeout: 15,
                forwarding_destination: 'mobile'
            }, undefined],
            forwarding_type: 'queue'
        };

        var result = {
            next_step_params: {
                in_call_responsible_ext_id: 3,
                first_call_act: 'lead',
                is_in_call_lost_auto_task: true,
                in_call_lost_task_target: 'some_target',
                call_lost_task_duration_id: 9384,
                success_call_tags: ['Тэг номер один', 'Тэг номер два'],
                lost_call_tags: ['Тэг номер три', 'Тэг номер четыре'],
                in_call_sales_funnel_id: 7271,
                in_call_sales_funnel_status_id: 9174,
                user_field: {
                    user_field_param_mnemonic: 'this_field',
                    user_field_id: 2149
                }
            },
            is_need_sync: false,
            next_step: 'integration_config',
            employees: [{
                ext_id: '1',
                email: 'turfanov@example.com',
                name: 'Артур',
                last_name: 'Турфанов',
                second_name: 'Аполлинариевич',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/96e/' +
                    '96eeee18f1cd372f340cfa8a55c50a5a/male3.jpeg',
                work_position: 'Руководитель'
            }, {
                ext_id: '2',
                email: 'chigrakov@example.com',
                name: 'Марк',
                last_name: 'Чиграков',
                second_name: 'Брониславович',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/e77/' +
                    'e770241492f5f2584d7491548a52429b/male4.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '3',
                email: 'zakirov@example.com',
                name: 'Эдуард',
                last_name: 'Закиров',
                second_name: 'Вячеславович',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/372/' +
                    '372932b87e81520d0740ad05ebf9e755/male5.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '4',
                email: 'vikashev@example.com',
                name: 'Елисей ',
                last_name: 'Викашев',
                second_name: 'Александрович',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/f99/' +
                    'f992827a29a3fdc7193992d5f70b8ee2/me.png',
                work_position: 'Менеджер'
            }, {
                ext_id: '5',
                email: 'gaidenko@example.com',
                name: 'Ярослав ',
                last_name: 'Гайденко',
                second_name: 'Капитонович',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/683/' +
                    '6831a3cc122c39610f2883660a2b4418/male1.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '6',
                email: 'yadryshnikova@example.com',
                name: 'Полина ',
                last_name: 'Ядрышникова',
                second_name: 'Валерьевна',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/a3c/' +
                    'a3c096899fb9688a2eee6eded2cf8173/female2.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '7',
                email: 'shetinina@example.com',
                name: 'Регина ',
                last_name: 'Щетинина',
                second_name: 'Святославовна',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d8a/' +
                    'd8abda5d8d7b87d7eed20b1b7592102b/female3.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '8',
                email: 'bayazova@example.com',
                name: 'Римма ',
                last_name: 'Баязова',
                second_name: 'Поликарповна',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/7cc/' +
                    '7ccd72da0b8e6e304d9fef048b74b121/female4.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '9',
                email: 'yazykina@example.com',
                name: 'Доминика ',
                last_name: 'Языкина',
                second_name: 'Ефимовна',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d3e/' +
                    'd3e115837e337eb8e4f6482b86ac336b/female1.jpeg',
                work_position: 'Менеджер'
            }, {
                ext_id: '10',
                email: '@example.com',
                name: 'Берта ',
                last_name: 'Лагутова',
                second_name: 'Владимировна',
                personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/b25/' +
                    'b253e0b7743e2b9b4a94cddb993d4258/female5.jpeg',
                work_position: 'Менеджер'
            }],
            tryout_response: {
                success: true,
                data: {
                    unsorted_on: 'N'
                }
            },
            data: {
                'comagic:amocrm:in_call_lost_task_target': [{
                    description_short: 'Некая цель пропущенного входящего звонка',
                    mnemonic: 'some_target'
                }, {
                    description_short: 'Другая цель пропущенного входящего звонка',
                    mnemonic: 'other_target'
                }],
                'comagic:amocrm:task_duration': [{
                    id: -1,
                    name: 'Весь день'
                }, {
                    id: 9384,
                    name: 'Некий срок'
                }],
                'comagic:amocrm:tag_tokens': [{
                    mnemonic: 'tag11',
                    description_short: 'Тэг номер одиннадцать'
                }, {
                    mnemonic: 'virtual_phone_number',
                    description_short: 'Виртуальный номер'
                }],
                'comagic:amocrm:sales_funnel': [{
                    id: 4719,
                    name: 'Некая воронка'
                }, {
                    id: 7271,
                    name: 'Другая воронка'
                }, {
                    id: 8175,
                    name: 'Еще одна воронка'
                }, {
                    id: 7186,
                    name: 'И еще одна воронка'
                }],
                'comagic:amocrm:sales_funnel_status': [{
                    funnel_id: 4719,
                    id: 7185,
                    name: 'Некий статус'
                }, {
                    funnel_id: 7271,
                    id: 1958,
                    name: 'Другой статус'
                }, {
                    funnel_id: 7271,
                    id: 9174,
                    name: 'Еще один статус'
                }, {
                    funnel_id: 4719,
                    id: 8195,
                    name: 'И еще один статус'
                }],
                'comagic:amocrm:user_field_event_params': [{
                    name: 'Это поле',
                    description: 'Это замечательное поле',
                    mnemonic: 'this_field'
                }, {
                    name: 'Виртуальный номер',
                    description: 'Виртуальный номер. Для входящих вызовов - номер, на который позвонил абонент. Для ' +
                        'исходящих вызовов - номер, который будет определяться у контакта.',
                    mnemonic: 'virtual_phone_number'
                }],
                'comagic:_tree:amocrm_user_fields': {
                    data: {
                        id: 2845,
                        name: 'Какое-то поле',
                        leaf: false,
                        data: [{
                            id: 2149,
                            name: 'Другое поле',
                            leaf: true,
                            data: []
                        }]
                    }
                }
            }
        };
        
        return {
            setSecondEmployeePhoneVerified: function () {
                bodyParams.employees[1] = {
                    ext_id: 1,
                    forwarding_timeout: 5,
                    forwarding_destination: 'mobile'
                };

                return this;
            },
            setSecondEmployeeForwardingToWidget: function () {
                bodyParams.employees[1] = {
                    ext_id: 1,
                    forwarding_timeout: 5,
                    forwarding_destination: 'widget'
                };

                return this;
            },
            setIgnoreTimeout: function () {
                delete(bodyParams.employees[0].forwarding_timeout);
                return this;
            },
            setDontChangeTimeout: function () {
                bodyParams.employees[0].forwarding_timeout = 25;
                return this;
            },
            addDynamicalTag: function () {
                result.next_step_params.success_call_tags.push('{{virtual_phone_number}}');
                return this;
            },
            setUnsorted: function () {
                result.next_step_params.first_call_act = 'unsorted';
                return this;
            },
            setUnsortedEnabled: function () {
                result.tryout_response.data.unsorted_on = 'Y';
                return this;
            },
            setToWidget: function () {
                bodyParams.employees[0].forwarding_destination = 'widget';
                return this;
            },
            setOtherEmployee: function () {
                bodyParams.employees[0].ext_id =  2;
                return this;
            },
            setAll: function () {
                bodyParams.forwarding_type = 'all';
                bodyParams.employees[0].forwarding_timeout = 5;
                return this;
            },
            setNoNextStepParams: function () {
                result.next_step_params = null;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/call_processing_config/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: result 
                    });
            }
        };
    };
    this.requestCodeInput = function () {
        var bodyParams = {
            ext_id: 9,
            code: '1234'
        };

        var result = {
            next_step_params: {
                employees: [{
                    ext_id: 9,
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: true,
                    number: 79161234567,
                    timer: null
                }, {
                    ext_id: 1,
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }, {
                    ext_id: 3,
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }],
            },
            is_need_sync: false,
            next_step: 'sms_verification'
        };

        return {
            setSecondEmployee: function () {
                bodyParams = {
                    ext_id: 1,
                    code: '2345'
                };

                result.next_step_params.employees[0].is_verified = false;
                result.next_step_params.employees[0].number = null;

                result.next_step_params.employees[1].is_verified = true;
                result.next_step_params.employees[1].number = 79162345678;

                return this;
            },
            setOnlyOneEmployeeSelected: function () {
                bodyParams.ext_id = 2;
                
                result.next_step_params.employees = [{
                    ext_id: 2,
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: true,
                    number: 79161234567,
                    timer: null
                }];

                return this;
            },
            setCodeInvalid: function () {
                result.next_step_params.employees[0].is_verified = false;
                result.next_step_params.employees[0].timer = 26;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/code_input/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: result
                    });
            }
        };
    };
    this.requestSms = function () {
        var bodyParams = {
            ext_id: 9,
            number: 79161234567
        };

        var employees = [{
            ext_id: 9,
            forwarding_timeout: 5,
            is_code_field_available: true,
            is_verified: false,
            number: 79162345678,
            timer: 60
        }, {
            ext_id: 1,
            forwarding_timeout: 5,
            is_code_field_available: false,
            is_verified: false,
            number: null,
            timer: null
        }, {
            ext_id: 3,
            forwarding_timeout: 5,
            is_code_field_available: false,
            is_verified: false,
            number: null,
            timer: null
        }];

        return {
            setOnlyOneEmployeeSelected: function () {
                bodyParams = {
                    ext_id: 2,
                    number: 79161234567
                };

                employees = [{
                    ext_id: 2,
                    forwarding_timeout: 5,
                    is_code_field_available: true,
                    is_verified: false,
                    number: 79161234567,
                    timer: 60
                }];

                return this;
            },
            setFourMinutes: function () {
                employees[0].timer = 60 * 4;
                return this;
            },
            setFourHours: function () {
                employees[0].timer = 60 * 60 * 4;
                return this;
            },
            setSecondEmployee: function () {
                bodyParams = {
                    ext_id: 1,
                    number: 79162345678
                };

                Ext.apply(employees[0], {
                    is_code_field_available: false,
                    is_verified: true,
                    timer: null
                });

                Ext.apply(employees[1], {
                    is_code_field_available: true,
                    number: 79162345678,
                    timer: 60
                });

                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/sms_request/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: {
                            next_step_params: {
                                employees: employees,
                            },
                            is_need_sync: false,
                            next_step: 'sms_verification'
                        }
                    });
            }
        };
    };
    this.requestUserSyncState = function () {
        var response = {
            success: true,
            result: false
        };

        return {
            setDone: function () {
                response.result = true;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/user_sync_state/').
                    expectBodyToContain({
                        user_sync_time: '2019-09-22 16:00:07.226314'
                    }).
                    respondSuccessfullyWith(response);
            }
        };
    };
    this.requestSyncEmployees = function () {
        var response = {
            success: true,
            result: {
                syncronized: false,
                user_sync_time: '2019-09-22 16:00:07.226314'
            }
        };

        return {
            setError: function () {
                delete(response.result);
                response.error = 'Invalid session';
                response.is_session_error = true;
                return this;
            },
            setDone: function () {
                response.result.syncronized = true;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/sync_employees/').
                    respondSuccessfullyWith(response);
            }
        };
    };
    this.requestChooseEmployees = function () {
        var bodyParams = {
            employees: [9, 1, 3]
        };

        var result = {
            is_need_sync: true,
            next_step: 'sms_verification',
            next_step_params: {
                forwarding_type: 'all',
                employees: [{
                    ext_id: '9',
                    name: 'Доминика',
                    last_name: 'Языкина',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d3e/' +
                        'd3e115837e337eb8e4f6482b86ac336b/female1.jpeg',
                    work_position: 'Менеджер',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    forwarding_destination: null,
                    number: null,
                    timer: null
                }, {
                    ext_id: '1',
                    name: 'Артур',
                    last_name: 'Турфанов',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/96e/' +
                        '96eeee18f1cd372f340cfa8a55c50a5a/male3.jpeg',
                    work_position: 'Руководитель',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    forwarding_destination: null,
                    number: null,
                    timer: null
                }, {
                    ext_id: '3',
                    name: 'Эдуард',
                    last_name: 'Закиров',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/372/' +
                        '372932b87e81520d0740ad05ebf9e755/male5.jpeg',
                    work_position: 'Менеджер',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    forwarding_destination: null,
                    number: null,
                    timer: null
                }]
            }
        };

        return {
            dontCheckEmployeesParam: function () {
                delete(bodyParams.employees);
                return this;
            },
            setDontChangeEmployees: function () {
                bodyParams.employees = [2, 4, 9];
                return this;
            },
            setOnlyOneEmployeeSelected: function () {
                bodyParams.employees = [2];

                result.next_step_params.employees = [{
                    ext_id: '2',
                    name: 'Марк',
                    last_name: 'Чиграков',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/e77/' +
                        'e770241492f5f2584d7491548a52429b/male4.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }];

                return this;
            },
            setQueue: function () {
                result.next_step_params.forwarding_type = 'queue';
                return this;
            },
            setToWidget: function () {
                result.next_step_params.employees[0].forwarding_destination = 'widget';
                return this;
            },
            setVerified: function () {
                result.next_step_params.employees[0].forwarding_timeout = 25;
                result.next_step_params.employees[0].is_verified = true;
                result.next_step_params.employees[0].number = 79161234567;
                return this;
            },
            setSecondEmployeePhoneVerified: function () {
                result.next_step_params.employees[1].forwarding_timeout = 25;
                result.next_step_params.employees[1].is_verified = true;
                result.next_step_params.employees[1].number = 79163456789;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/choose_employees/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: result 
                    });
            }
        };
    };
    this.requestEmployees = function () {
        var result = {
                employees: [{
                    ext_id: '1',
                    email: 'turfanov@example.com',
                    name: 'Артур',
                    last_name: 'Турфанов',
                    second_name: 'Аполлинариевич',
                    personal_photo: null,
                    work_position: 'Руководитель'
                }, {
                    ext_id: '2',
                    email: 'chigrakov@example.com',
                    name: 'Марк',
                    last_name: 'Чиграков',
                    second_name: 'Брониславович',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/e77/' +
                        'e770241492f5f2584d7491548a52429b/male4.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '3',
                    email: 'zakirov@example.com',
                    name: 'Эдуард',
                    last_name: 'Закиров',
                    second_name: 'Вячеславович',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/372/' +
                        '372932b87e81520d0740ad05ebf9e755/male5.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '4',
                    email: 'vikashev@example.com',
                    name: 'Елисей ',
                    last_name: 'Викашев',
                    second_name: 'Александрович',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/f99/' +
                        'f992827a29a3fdc7193992d5f70b8ee2/me.png',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '5',
                    email: 'gaidenko@example.com',
                    name: 'Ярослав ',
                    last_name: 'Гайденко',
                    second_name: 'Капитонович',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/683/' +
                        '6831a3cc122c39610f2883660a2b4418/male1.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '6',
                    email: 'yadryshnikova@example.com',
                    name: 'Полина ',
                    last_name: 'Ядрышникова',
                    second_name: 'Валерьевна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/a3c/' +
                        'a3c096899fb9688a2eee6eded2cf8173/female2.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '7',
                    email: 'shetinina@example.com',
                    name: 'Регина ',
                    last_name: 'Щетинина',
                    second_name: 'Святославовна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d8a/' +
                        'd8abda5d8d7b87d7eed20b1b7592102b/female3.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '8',
                    email: 'bayazova@example.com',
                    name: 'Римма ',
                    last_name: 'Баязова',
                    second_name: 'Поликарповна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/7cc/' +
                        '7ccd72da0b8e6e304d9fef048b74b121/female4.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '9',
                    email: 'yazykina@example.com',
                    name: 'Доминика ',
                    last_name: 'Языкина',
                    second_name: 'Ефимовна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d3e/' +
                        'd3e115837e337eb8e4f6482b86ac336b/female1.jpeg',
                    work_position: 'Менеджер'
                }, {
                    ext_id: '10',
                    email: '@example.com',
                    name: 'Берта ',
                    last_name: 'Лагутова',
                    second_name: 'Владимировна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/b25/' +
                        'b253e0b7743e2b9b4a94cddb993d4258/female5.jpeg',
                    work_position: 'Менеджер'
                }],
                is_need_sync: null,
                next_step: 'choose_employees',
                next_step_params: {
                    employees: [4, 2, 9] 
                }
            };

        return {
            setOneEmployeeSelected: function () {
                result.next_step_params.employees = [9];
                return this;
            },
            setTwoEmployeesSelected: function () {
                result.next_step_params.employees = [9, 1];
                return this;
            },
            setNoEmployeesSelected: function () {
                result.next_step_params.employees = [];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/amocrm/employees/').
                    respondSuccessfullyWith({
                        success: true,
                        result: result 
                    });
            }
        };
    };

    this.expectWindowToBeReloaded = function () {
        throw new Error('Окно должно быть перезагружено');
    };

    this.tryForFreeButton = testersFactory.createButtonTester(function () {
        return EasyStart.getApplication().findComponent('button[text="Тестировать бесплатно"]');
    });

    this.settingsStep = function (title) {
        function getStepContainer () {
            var titleEl = Ext.fly(utils.findElementByTextContent(
                EasyStart.getApplication().findComponent('comagic-stepwise-panel'), title,
                '.cm-stepwise-step-title-text'
            ));

            if (!titleEl) {
                throw new Error('Не найден шаг с заголовком "' + title + '"');
            }
            
            return Ext.ComponentManager.get(Ext.fly(titleEl).up('.x-component-cm-stepwise-step-title').dom.id).
                up('container');
        }

        return {
            querySelectorAll: function (selector) {
                return getStepContainer().el.query(selector);
            },
            querySelector: function (selector) {
                return getStepContainer().el.down(selector).dom;
            },
            down: function (selector) {
                return getStepContainer().down(selector);
            },
            backButton: function () {
                return testersFactory.createButtonTester(getStepContainer().down('button[text="Назад"]'));
            },
            nextButton: function () {
                return testersFactory.createButtonTester(getStepContainer().down('button[text="Продолжить"]'));
            },
            applyButton: function () {
                return testersFactory.createButtonTester(getStepContainer().down('button[text="Стать клиентом"]'));
            }
        };
    };

    this.testCallPanelDescendantWithText = function (expectedText) {
        return testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(
                me.settingsStep('Тестовый звонок').querySelector('.cm-stepwise-step-content'),
                expectedText
            );
        });
    };

    this.integrationConfigForm = ((function () {
        function FieldGetter (factoryMethodName) {
            return function () {
                return {
                    withFieldLabel: function (fieldLabel) {
                        return testersFactory[factoryMethodName](Ext.ComponentManager.get(
                            utils.findElementByTextContent(
                                getIntegrationSettingsTabpanel(), fieldLabel, '.x-component'
                            ).id
                        ).nextSibling(), fieldLabel);
                    }
                };
            };
        }

        return {
            combobox: FieldGetter('createComboBoxTester')
        };
    }).bind(this))();

    this.addSuccessfulCallTagButton = testersFactory.createDomElementTester(function () {
        return me.settingsStep('Настройка интеграции').querySelectorAll('.ul-btn-usual-icon-cls-plus')[0];
    });

    this.addLostCallTagButton = testersFactory.createDomElementTester(function () {
        return me.settingsStep('Настройка интеграции').querySelectorAll('.ul-btn-usual-icon-cls-plus')[1];
    });

    this.employeesGrid = testersFactory.createGridTester(function () {
        return me.settingsStep('Сотрудники').down('grid');
    });

    this.callProcessingGrid = testersFactory.createGridTester(function () {
        return me.settingsStep('Правила обработки вызовов').down('grid');
    });

    function phoneRedirectColumn () {
        return me.callProcessingGrid.row().first().column().withHeader('Переадресация на телефон сотрудника *').
            getElement();
    }

    function secondPhoneRedirectColumn () {
        return me.callProcessingGrid.row().atIndex(1).column().withHeader('Переадресация на телефон сотрудника *').
            getElement();
    }

    this.employeePhoneField = function () {
        return testersFactory.createTextFieldTester(Ext.ComponentManager.get(
            phoneRedirectColumn().querySelector('.x-form-type-text').id));
    };

    this.secondEmployeeNumberFieldsContainer = testersFactory.createDomElementTester(function () {
        return secondPhoneRedirectColumn().querySelector('.easystart-number-fields');
    });

    this.secondEmployeePhoneField = function () {
        return testersFactory.createTextFieldTester(Ext.ComponentManager.get(
            secondPhoneRedirectColumn().querySelector('.x-form-type-text').id));
    };

    this.toWidgetRadioButton = function () {
        return testersFactory.createRadioFieldTester(Ext.ComponentManager.get(Ext.fly(
            utils.findElementByTextContent(phoneRedirectColumn(), 'В виджет', 'label')
        ).up('.x-form-type-radio').dom.id));
    };

    this.secondToWidgetRadioButton = function () {
        return testersFactory.createRadioFieldTester(Ext.ComponentManager.get(Ext.fly(
            utils.findElementByTextContent(secondPhoneRedirectColumn(), 'В виджет', 'label')
        ).up('.x-form-type-radio').dom.id));
    };

    this.toMobilePhoneButton = function () {
        return testersFactory.createRadioFieldTester(Ext.ComponentManager.get(Ext.fly(
            utils.findElementByTextContent(phoneRedirectColumn(), 'На мобильный телефон', 'label')
        ).up('.x-form-type-radio').dom.id));
    };

    this.receiveSmsButton = testersFactory.createButtonTester(function () {
        return Ext.ComponentManager.get(phoneRedirectColumn().querySelectorAll('.x-btn-ul-main-medium')[0].id);
    });

    this.secondReceiveSmsButton = testersFactory.createButtonTester(function () {
        return Ext.ComponentManager.get(utils.findElementByTextContent(secondPhoneRedirectColumn(), 'Получить SMS',
            '.x-btn-ul-main-medium').id);
    });

    this.smsCodeField = function () {
        return testersFactory.createTextFieldTester(
            Ext.ComponentManager.get(Ext.fly(
                phoneRedirectColumn().querySelector('input[placeholder="Код из SMS"]')
            ).up('.x-field').dom.id)
        );
    };

    this.secondSmsCodeField = function () {
        return testersFactory.createTextFieldTester(
            Ext.ComponentManager.get(Ext.fly(
                secondPhoneRedirectColumn().querySelector('input[placeholder="Код из SMS"]')
            ).up('.x-field').dom.id)
        );
    };

    this.confirmNumberButton = testersFactory.createButtonTester(function () {
        return Ext.ComponentManager.get(utils.findElementByTextContent(phoneRedirectColumn(), 'Подтвердить',
            '.x-btn-ul-main-medium').id);
    });

    this.secondConfirmNumberButton = testersFactory.createButtonTester(function () {
        return Ext.ComponentManager.get(utils.findElementByTextContent(secondPhoneRedirectColumn(), 'Подтвердить',
            '.x-btn-ul-main-medium').id);
    });

    this.dialTimeField = function () {
        return testersFactory.createTextFieldTester(Ext.ComponentManager.get(
            me.callProcessingGrid.row().first().column().withHeader('Время дозвона').getElement().
                querySelector('.x-field').id
        ));
    };

    this.forwardingTypeButtons = testersFactory.createComponentTester(function () {
        return me.settingsStep('Правила обработки вызовов').down('button[text="Одновременно всем"]').
            up('container');
    });

    this.simoultaneousForwardingTypeButton = function () {
        return testersFactory.createButtonTester(function () {
            return me.settingsStep('Правила обработки вызовов').down('button[text="Одновременно всем"]');
        });
    };

    this.sequentialForwardingTypeButton = function () {
        return testersFactory.createButtonTester(function () {
            return me.settingsStep('Правила обработки вызовов').down('button[text="По очереди"]');
        });
    };

    this.orderTestCallButton = testersFactory.createButtonTester(function () {
        return me.settingsStep('Тестовый звонок').down('button[text="Заказать тестовый звонок"]');
    });

    this.callsHistoryGrid = testersFactory.createGridTester(function () {
        return me.settingsStep('Тестовый звонок').down('grid');
    });

    this.floatingForm = testersFactory.createFormTester(function () {
        return utils.getFloatingComponent();
    });

    this.floatingComponent = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent();
    });

    this.orderCallbackButton = testersFactory.createButtonTester(function () {
        return utils.getFloatingComponent().down('button[text="Заказать обратный звонок"]');
    });

    this.closeWindowButton = testersFactory.createButtonTester(function () {
        return utils.getFloatingComponent().down('button[text="Закрыть"]');
    });

    this.okWindowButton = testersFactory.createButtonTester(function () {
        return utils.getFloatingComponent().down('button[text="OK"]');
    });

    this.cancelWindowButton = testersFactory.createButtonTester(function () {
        return utils.getFloatingComponent().down('button[text="Отмена"]');
    });

    this.textFieldInWindow = function () {
        return testersFactory.createTextFieldTester(utils.getFloatingComponent().down('textfield'));
    };

    this.tryForFreeInWindowButton = testersFactory.createButtonTester(function () {
        return utils.getFloatingComponent().down('button[text="Тестировать бесплатно"]');
    });

    this.tooltipTrigger = testersFactory.createDomElementTester(function () {
        return me.settingsStep('Номер телефона').querySelector('.easystart-text-with-tooltip');
    });

    function getIntegrationSettingsTabpanel () {
        return Ext.ComponentManager.get(me.settingsStep('Настройка интеграции').
            querySelector('.cm-stepwise-step-content').id);
    }

    this.integrationSettingsTabpanel = testersFactory.createTabPanelTester(getIntegrationSettingsTabpanel);

    var getTaggingPanel = function () {
        return me.settingsStep('Настройка интеграции').down('panel[title="Тегирование"]');
    };

    this.tagRemoveTool = function (text) {
        return testersFactory.createDomElementTester(function () {
            var viewItem = utils.findElementByTextContent(getTaggingPanel().el.dom, text, '.x-dataview-item');
            return viewItem && viewItem.querySelector('img');
        });
    };

    function tagRemoveTool (index, text) {
        var container = getTaggingComboBoxes()[index].up('container').up('container');

        return testersFactory.createDomElementTester(function () {
            var viewItem = utils.findElementByTextContent(container.el.dom, text, '.x-dataview-item');
            return viewItem && viewItem.querySelector('img');
        });
    }

    this.successfulCallsTagRemoveTool = function (text) {
        return tagRemoveTool(0, text);
    };

    this.lostCallsTagRemoveTool = function (text) {
        return tagRemoveTool(1, text);
    };

    var getTaggingComboBoxes = function () {
        return getTaggingPanel().query('combobox');
    };

    this.successfulCallsTagsCombo = function () {
        return testersFactory.createComboBoxTester(getTaggingComboBoxes()[0]);
    };

    this.lostCallsTagsCombo = function () {
        return testersFactory.createComboBoxTester(getTaggingComboBoxes()[1]);
    };

    this.uisFieldExpander = testersFactory.createDomElementTester(function () {
        return utils.getFloatingComponent().el.down('.x-tree-expander').dom;
    });

    this.uisFieldRow = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(utils.getFloatingComponent(), 'Другое поле', '.x-tree-node-text');
    });

    this.expectNoErrorMessageToBeVisible = function () {
        if (Array.prototype.some.call(document.querySelectorAll('.ul-label-warning'), function (element) {
            return utils.isVisible(element);
        })) {
            throw new Error('Сообщение об ошибке не должно быть отображено');
        }
    };

    this.errorMessage = function (message) {
        return testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.body, message, '.ul-label-warning');
        });
    };

    this.phoneNumber = testersFactory.createDomElementTester(function () {
        return document.querySelector('.easystart-panel-settings-show-number-phone');
    });

    this.titleOfPhoneNumberTooltip = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(document.body, 'После тестового периода вы сможете:', '.x-title-text');
    });

    this.sessionErrorMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(document.body, 'Время действия сессии истекло', '.x-window-body');
    });

    function eachSpinner (handler) {
        var spinners = document.querySelectorAll('.x-mask-msg-text'),
            i = 0,
            length = spinners.length,
            spinner;

        function stop () {
            handler.handleDone = function() {};
            i = length;
        }

        for (i = 0; i < length; i ++) {
            spinner = spinners[i];

            if (utils.isVisible(spinner)) {
                handler.handleVisible(stop);
            }
        }

        handler.handleDone();
    }

    this.expectSpinnerToBeVisible = function () {
        eachSpinner({
            handleVisible: function (stop) {
                stop();
            },
            handleDone: function () {
                throw new Error('Спиннер должен быть видимым');
            }
        });
    };

    this.expectSpinnerToBeHidden = function () {
        eachSpinner({
            handleVisible: function () {
                throw new Error('Спиннер должен быть скрытым');
            },
            handleDone: function () {}
        });
    };

    function SupportRequestSender () {
        window.Comagic = window.Comagic || {};

        var responseHandler = Ext.emptyFn,
            doBeforeResponse;

        function throwRequestWasNotSent () {
            throw new Error('Запрос не был отправлен.');
        }

        function addOfflineRequest (params, callback) {
            responseHandler = callback || Ext.emptyFn;
            doBeforeResponse = reset; 

            window.Comagic.addOfflineRequest = function () {
                throw new Error('Ответ на запрос еще не получен.');
            };

            expectRequestParamsToContain = function (expectedParams) {
                utils.expectToContain(params, expectedParams);
            };
        }

        function reset () {
            doBeforeResponse = throwRequestWasNotSent;
            window.Comagic.addOfflineRequest = addOfflineRequest;
        }

        function handleResponse (result) {
            doBeforeResponse();
            responseHandler({
                responseText: JSON.stringify(result)
            });
        }

        this.respondSuccessfully = function () {
            handleResponse({
                success: true,
                result: {
                    code: '030'
                }
            });
        };

        this.respondUnsuccessfully = function () {
            handleResponse({
                success: false,
                result: {
                    message: 'Invalid type for field "phone"'
                }
            });
        };

        this.expectRequestParamsToContain = function (expectedParams) {
            expectRequestParamsToContain(expectedParams);
        };
        
        this.setNoSitePhone = function () {
            window.Comagic.addOfflineRequest = null;
        };

        var expectRequestParamsToContain = throwRequestWasNotSent;
        reset();
    }

    this.supportRequestSender = new SupportRequestSender();
}
