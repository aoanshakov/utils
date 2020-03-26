function EasystartBitrix(requestsManager, testersFactory, utils) {
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
            ext_id: 2
        },
        success: true,
        partner: 'bitrix'
    };

    this.setFatalError = function () {
        easyStartApplicationState = {
            success: false,
            error: 'Произошла фатальная ошибка',
            partner: 'bitrix'
        };
    };
    this.requestOrderCallback = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/order_callback/').
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
            }
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
                    expectToHavePath('/easystart/bitrix/easy_start_calls/'));
            }
        };
    };
    this.requestTestCall = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/test_call/').
                    respondSuccessfullyWith({
                        success: true,
                        result: 83921
                    });
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
                    expectToHavePath('/easystart/bitrix/test_call_task_state/').
                    respondSuccessfullyWith({
                        success: true,
                        result: result
                    });
            }
        };
    };
    this.requestIntegrationConfig = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/integration_config/').
                    expectBodyToContain({
                        is_create_deal: true,
                        responsible_ext_id: 3
                    }).
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
                forwarding_timeout: 15
            }],
            forwarding_type: 'queue'
        };
        
        return {
            setOtherEmployee: function () {
                bodyParams.employees[0].ext_id =  2;
                return this;
            },
            setAll: function () {
                bodyParams.forwarding_type = 'all';
                bodyParams.employees[0].forwarding_timeout = 5;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/call_processing_config/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: {
                            next_step_params: {
                                is_create_deal: true,
                                responsible_ext_id: 3
                            },
                            is_need_import_users: false,
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
                                name: 'Эдуард ',
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
                            }]
                        }
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
            is_need_import_users: false,
            next_step: 'sms_verification'
        };

        return {
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
                    expectToHavePath('/easystart/bitrix/code_input/').
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
                    expectToHavePath('/easystart/bitrix/sms_request/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: {
                            next_step_params: {
                                employees: employees,
                            },
                            is_need_import_users: false,
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
                    expectToHavePath('/easystart/bitrix/user_sync_state/').
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
            setDone: function () {
                response.result.syncronized = true;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/sync_employees/').
                    respondSuccessfullyWith(response);
            }
        };
    };
    this.requestChooseEmployees = function () {
        var bodyParams = {
            employees: [9, 1, 3]
        };

        var result = {
            is_need_import_users: true,
            next_step: 'sms_verification',
            next_step_params: {
                forwarding_type: 'all',
                employees: [{
                    ext_id: '9',
                    name: 'Доминика',
                    last_name: 'Языкина',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/d3e/' +
                        'd3e115837e337eb8e4f6482b86ac336b/female1.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }, {
                    ext_id: '1',
                    name: 'Артур',
                    last_name: 'Турфанов',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/96e/' +
                        '96eeee18f1cd372f340cfa8a55c50a5a/male3.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }, {
                    ext_id: '3',
                    name: 'Эдуард ',
                    last_name: 'Закиров',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/372/' +
                        '372932b87e81520d0740ad05ebf9e755/male5.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }]
            }
        };

        return {
            changeSelected: function () {
                bodyParams.employees = [1, 2, 8];

                result.next_step_params.employees = [{
                    ext_id: '1',
                    name: 'Артур',
                    last_name: 'Турфанов',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/96e/' +
                        '96eeee18f1cd372f340cfa8a55c50a5a/male3.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }, {
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
                }, {
                    ext_id: '8',
                    email: 'bayazova@example.com',
                    name: 'Римма ',
                    last_name: 'Баязова',
                    second_name: 'Поликарповна',
                    personal_photo: 'https://cdn.bitrix24.ru/b4459557/main/7cc/' +
                        '7ccd72da0b8e6e304d9fef048b74b121/female4.jpeg',
                    forwarding_timeout: 5,
                    is_code_field_available: false,
                    is_verified: false,
                    number: null,
                    timer: null
                }];

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
            setVerified: function () {
                result.next_step_params.employees[0].forwarding_timeout = 25;
                result.next_step_params.employees[0].is_verified = true;
                result.next_step_params.employees[0].number = 79161234567;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/choose_employees/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        result: result 
                    });
            }
        };
    };
    this.requestEmployees = function () {
        var queryParams = {};

        var employees = [{
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
            name: 'Эдуард ',
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
        }];

        var response = {
            success: true,
            result: {
                employees: employees,
                is_need_import_users: null,
                next_step: 'choose_employees',
                next_step_params: {
                    employees: [4, 2, 9] 
                }
            } 
        };

        return {
            setEmployeeWithoutPhoto: function () {
                response.result.employees[0].personal_photo = null;
                return this;
            },
            setOnlyOneEmployeeSelected: function () {
                response.result.next_step_params.employees = [9];
                return this;
            },
            setTwoEmployeesSeleted: function () {
                response.result.next_step_params.employees = [4, 9];
                return this;
            },
            setNoEmployeesSelected: function () {
                response.result.next_step_params.employees = [];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/employees/').
                    expectToHaveMethod('POST').
                    expectQueryToContain(queryParams).
                    respondSuccessfullyWith(response);
            }
        };
    };

    this.requestCreateAccount = function () {
        var response = {
            success: true,
            result: {
                next_step : 'show_number',
                next_step_params: {
                    number: 79031234567
                },
                is_need_import_users: null
            }
        };

        return {
            setExtIdWasAlreadyUsed: function () {
                delete(response.result);
                response.success = false;
                response.error = 'ext_id_was_already_used';
                return this;
            },
            setNoPhone: function () {
                delete(response.result);
                response.success = false;
                response.error = 'incorrect_phone';
                return this;
            },
            setArchive: function () {
                delete(response.result);
                response.success = false;
                response.error = 'user_is_archive';
                return this;
            },
            setActive: function () {
                delete(response.result);
                response.success = false;
                response.error = 'user_is_active_and_not_trial';
                return this;
            },
            setIdMismatch: function () {
                delete(response.result);
                response.success = false;
                response.error = 'ext_id_mismatch';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/easystart/bitrix/show_number/').
                    respondSuccessfullyWith(response);
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
            return Ext.ComponentManager.get(Ext.fly(utils.findElementByTextContent(
                EasyStart.getApplication().findComponent('comagic-stepwise-panel'), title,
                '.cm-stepwise-step-title-text'
            )).up('.x-component-cm-stepwise-step-title').dom.id).up('container');
        }

        return {
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
            },
        };
    };

    this.responsibleEmployeesCombo = function () {
        return testersFactory.createComboBoxTester(this.settingsStep('Настройка интеграции').down('combobox'));
    };

    function getEmployeesGrid () {
        return me.settingsStep('Сотрудники').down('grid');
    }

    this.employeesGrid = testersFactory.createGridTester(getEmployeesGrid);

    this.expectEmployeesSelectionToBeEnabled = function () {
        testersFactory.createComponentTester(getEmployeesGrid).
            expectNotToHaveClass('easystart-employees-grid-selection-disabled');
    };

    this.expectEmployeesSelectionToBeDisabled = function () {
        testersFactory.createComponentTester(getEmployeesGrid).
            expectToHaveClass('easystart-employees-grid-selection-disabled');
    };

    this.callProcessingGrid = testersFactory.createGridTester(function () {
        return me.settingsStep('Правила обработки вызовов').down('grid');
    });

    this.callsHistoryGrid = testersFactory.createGridTester(function () {
        return me.settingsStep('Тестовый звонок').down('grid');
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
            phoneRedirectColumn().querySelector('.x-field').id));
    };

    this.secondEmployeePhoneField = function () {
        return testersFactory.createTextFieldTester(Ext.ComponentManager.get(
            secondPhoneRedirectColumn().querySelector('.x-field').id));
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

    this.tooltipTrigger = testersFactory.createDomElementTester(function () {
        return me.settingsStep('Номер телефона').querySelector('.easystart-text-with-tooltip');
    });

    this.titleOfPhoneNumberTooltip = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(document.body, 'После тестового периода вы сможете:', '.x-title-text');
    });

    this.errorMessage = function (message) {
        return testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.body, message, '.ul-label-warning');
        });
    };

    this.fatalErrorMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(
            document.body, 'Ошибка Произошла фатальная ошибка', '.x-component'
        );
    });

    this.phoneNumber = testersFactory.createDomElementTester(function () {
        return document.querySelector('.easystart-panel-settings-show-number-phone');
    });

    this.secondEmployeeNumberFieldsContainer = testersFactory.createDomElementTester(function () {
        return secondPhoneRedirectColumn().querySelector('.easystart-number-fields');
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

    window.BX24 = {
        init: function (callback) {
            callback();
        },
        callMethod: function (method, params, callback) {
            callback = callback || Ext.emptyFn;

            if (method == 'user.current') {
                callback({
                    data: function () {
                        return {
                            NAME: 'Марк',
                            SECOND_NAME: 'Брониславович',
                            LAST_NAME: 'Чиграков',
                            EMAIL: 'chigrakov@example.com'
                        };
                    }
                });
            }
        },
        getScrollSize: function () {
            return {
                scrollWidth: 635
            };
        },
        resizeWindow: function (widget, height) {},
        reloadWindow: function () {
            me.expectWindowToBeReloaded = Ext.emptyFn;
        }
    };
}
