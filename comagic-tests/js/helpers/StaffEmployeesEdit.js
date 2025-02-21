tests.requireClass('Comagic.staff.employees.controller.EditPage');

function StaffEmployeesEdit({ requestsManager, testersFactory, utils }) {
    StaffEmployeesEdit.makeOverrides = function () {
        Ext.define('Comagic.test.staff.employees.view.EditPage', {
            override: 'Comagic.staff.employees.view.EditPage',
            autoScroll: true
        });

        StaffEmployeesEdit.makeOverrides = Ext.emptyFn;
    };

    StaffEmployeesEdit.makeOverrides();

    var controller = Comagic.getApplication().getController('Comagic.staff.employees.controller.EditPage');

    this.actionIndex = function (data) {
        controller.init();

        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    /*
    this.setFeatureUnavailable = function () {
        Comagic.getApplication().setFeatureUnavailable('hidden_numbers');
    };

    this.employeeUserAddingRequest = function () {
        const permissions = [{
            permission_unit_id: 'operator_workplace_access',
            is_insert: false,
            is_select: false,
            is_update: false,
            is_delete: false,
        }, {
            permission_unit_id: 'chats',
            is_insert: true,
            is_select: true,
            is_update: true,
            is_delete: true,
        }, {
            permission_unit_id: 'channel_management',
            is_insert: true,
            is_select: true,
            is_update: true,
            is_delete: true,
        }];

        function addResponseModifiers (me) {
            me.operatorWorkplaceSelectAvailable = function () {
                permissions[0].is_select = true;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent: function () {
                const request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/add_employee_user/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        id: 104561,
                        data: {
                            login: 'chenkova',
                            password: 'Qwerty123',
                            permissions: utils.expectToInclude(permissions),
                        },
                    });

                return addResponseModifiers({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith({
                            data: [],
                            success: true,
                        });
                    },
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            },
        });
    };
    */

    this.loginValidationRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/staff/employees/validate_login/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        login: ['chenkova'],
                        user_id: ['710999'],
                    }).
                    respondSuccessfullyWith({
                        data: [],
                        success: true,
                    });
            }
        };
    };

    /*
    this.employeeUserRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/get_employee_user/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            manager_limit: {
                                real_value: 1,
                                max_value: 50,
                                is_max_limit_reached: false,
                                top_value: 4,
                                user_charge_diff: 0,
                                is_limit_reached: false
                            },
                            employee_limit: {
                                real_value: 1,
                                max_value: 50,
                                is_max_limit_reached: false,
                                top_value: 4,
                                user_charge_diff: 0,
                                is_limit_reached: false
                            },
                            operators_limit: {
                                real_value: 1,
                                max_value: 50,
                                is_max_limit_reached: false,
                                top_value: 4,
                                user_charge_diff: 0,
                                is_limit_reached: false
                            },
                            user_data: null
                        }
                    });
            }
        };
    };

    this.sipLimitsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('services/ats__sip/read/sip_limits/').
                    respondSuccessfullyWith({
                        user_charge_diff: 0,
                        success: true,
                        is_limit_reached: true,
                        real_value: 47,
                        max_value: 100,
                        is_max_limit_reached: false,
                        top_value: 47
                    });
            }
        };
    };
    */

    function getEmployeeData (callback) {
        var data = {
            employee: [{
                sip_line_number_capacity__is_select: false,
                consultant_operator_display_name: 'Ченкова Виселина',
                last_name: 'Ченкова',
                coach_employee_id: null,
                position_id: null,
                token_expiration_date: null,
                avatar_offset_left: null,
                app_id: 4735,
                is_sending_credentials_enabled: null,
                licenses: [
                    'omni'
                ],
                schedule_id: null,
                sip_line_number_capacity__is_update: null,
                full_name: 'Ченкова Виселина',
                position_name: null,
                had_token: false,
                record_talk_direction: 'all',
                id: 104561,
                is_webrtc_token_enabled: false,
                is_chat_acceptance_confirmation: true,
                is_out_calls_auto_answer_enabled: false,
                password: '',
                user_id: 710999,
                avatar_height: null,
                call_center_role: null,
                webrtc_token: null,
                sip_line_number_capacity__number_capacity_ids: null,
                out_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                online_monitoring__is_select: false,
                is_need_out_call_rating: false,
                other_employee_chats_access__is_select: false,
                avatar_source_link: null,
                permissions: null,
                email: 'v.chenkova@gmail.com',
                is_permission_granted: true,
                another_email_to_send: null,
                avatar_offset_top: null,
                is_called_always: null,
                out_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                sip_line_number_capacity__is_allowed: null,
                app_role_id: null,
                is_active: true,
                first_name: 'Виселина',
                is_need_hide_numbers: false,
                personal_phone: null,
                is_click_to_call_auto_answer_enabled: false,
                avatar_key: null,
                manager_group_ids: [],
                avatar_link: null,
                group_ids: [],
                sip_line_number_capacity__region_prefixes: null,
                avatar_width: null,
                sip_line_number_capacity__parent_region_ids: null,
                user_type: 'user',
                dataapi__is_select: false,
                callapi__is_select: false,
                in_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                softphone_all_calls_stat__is_select: true,
                token: null,
                employee_manager_ids: [],
                avatar_source_key: null,
                has_sip: false,
                in_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                call_queue_management__is_select: false,
                login: 'chenkova',
                dataapi_agent__is_select: false,
                manager_employee_ids: [],

                other_employee_chats_permission_type: null,
                other_employee_chats_permission_values: null,
            }],
            phone: [],
            phone_in_employee: [],
        };

        (callback || function () {})(data);

        return data;
    }

    this.employeeChangeRequest = function () {
        var modifyEmployee = function () {};

        return {
            someGroupsHaveAccessToOtherEmployeesChats() {
                modifyEmployee = function (employee) {
                    employee.other_employee_chats_access__is_select = true;
                    employee.other_employee_chats_permission_type = 'groups';
                    employee.other_employee_chats_permission_values = [729768, 175760];
                };

                return this;
            },

            /*

            someEmployeesHaveAccessToOtherEmployeesChats() {
                modifyEmployee = function (employee) {
                    employee.other_employee_chats_permission_type = 'employees';
                    employee.other_employee_chats_permission_values = [568719, 2498759];
                };

                return this;
            },

            isOtherOutgoingCallsAutoAnswerEnabled: function () {
                modifyEmployee = function (employee) {
                    employee.is_out_calls_auto_answer_enabled = true;
                };

                return this;
            },
            isClickToCallAutoAnswerEnabled: function () {
                modifyEmployee = function (employee) {
                    employee.is_click_to_call_auto_answer_enabled = true;
                };

                return this;
            },
            isNeedHideNumbers: function () {
                modifyEmployee = function (employee) {
                    employee.is_need_hide_numbers = true;
                };

                return this;
            },
            */
            receiveResponse: function () {
                var body = {
                    employee: {
                        create: [],
                        update: [{
                            first_name: 'Виселина',
                        }],
                        destroy: []
                    },
                    phone_in_employee: {
                        create: [],
                        update: [],
                        destroy: []
                    },
                    phone: {
                        create: [],
                        update: [],
                        destroy: []
                    },
                };

                modifyEmployee(body.employee.update[0]);

                requestsManager.recentRequest().
                    expectToHavePath('/staff/employees/change/').
                    expectToHaveMethod('POST').
                    expectQueryToContain({
                        employee_id: '104561',
                    }).
                    expectBodyToContain(body).
                    respondSuccessfullyWith({
                        success: true,
                        data: getEmployeeData(function (data) {
                            data.employee[0].first_name = 'Веселина';
                            modifyEmployee(data.employee[0]);
                        })
                    });
            }
        };
    };

    this.employeeRequest = function () {
        const response = {
            data: getEmployeeData(),
            success: true,
            metadata: [{
                fields: [
                    'sip_line_number_capacity__is_select',
                    'consultant_operator_display_name',
                    'coach_employee_id',
                    'last_name',
                    'avatar_height',
                    'position_id',
                    'token_expiration_date',
                    'avatar_offset_left',
                    'app_id',
                    'is_sending_credentials_enabled',
                    'licenses',
                    'schedule_id',
                    'sip_line_number_capacity__is_update',
                    'full_name',
                    'position_name',
                    'had_token',
                    'record_talk_direction',
                    {
                        name: 'id',
                        primary_key: true
                    },
                    'is_webrtc_token_enabled',
                    'is_chat_acceptance_confirmation',
                    'is_out_calls_auto_answer_enabled',
                    'manager_group_ids',
                    'user_id',
                    'avatar_link',
                    'call_center_role',
                    'webrtc_token',
                    'sip_line_number_capacity__number_capacity_ids',
                    'out_internal_allowed_call_directions',
                    'online_monitoring__is_select',
                    'is_need_out_call_rating',
                    'avatar_source_link',
                    'in_external_allowed_call_directions',
                    'email',
                    'is_permission_granted',
                    'another_email_to_send',
                    'avatar_offset_top',
                    'is_called_always',
                    'out_external_allowed_call_directions',
                    'sip_line_number_capacity__is_allowed',
                    'app_role_id',
                    'is_active',
                    'first_name',
                    'is_need_hide_numbers',
                    'personal_phone',
                    'is_click_to_call_auto_answer_enabled',
                    'avatar_key',
                    'password',
                    'permissions',
                    'group_ids',
                    'avatar_width',
                    'sip_line_number_capacity__region_prefixes',
                    'sip_line_number_capacity__parent_region_ids',
                    'user_type',
                    'dataapi__is_select',
                    'callapi__is_select',
                    'in_internal_allowed_call_directions',
                    'softphone_all_calls_stat__is_select',
                    'token',
                    'employee_manager_ids',
                    'avatar_source_key',
                    'has_sip',
                    'other_employee_chats_access__is_select',
                    'call_queue_management__is_select',
                    'login',
                    'dataapi_agent__is_select',
                    'manager_employee_ids',
                    'other_employee_chats_permission_type',
                    'other_employee_chats_permission_values',
                ],
                belongs_to: [],
                name: 'employee',
                has_many: [{
                    table: 'phone_in_employee',
                    foreign_key: 'employee_id'
                }]
            }, {
                fields: [
                    'number_capacity_id',
                    'channels_count',
                    'employee_id',
                    'protocol',
                    'forwarding_timeout',
                    'phone_id',
                    'is_trunk_multi',
                    'is_active',
                    'priority',
                    'phone',
                    'schedule_id',
                    'sip_trunk_destination_number',
                    'number_capacity_usage_rule',
                    'password',
                    'type',
                    {
                        name: 'id',
                        primary_key: true
                    },
                    'is_multiterminal',
                    'is_allow_in_sip_uri_calls'
                ],
                belongs_to: [{
                    table: 'employee',
                    foreign_key: 'employee_id'
                }, {
                    table: 'phone',
                    foreign_key: 'phone_id'
                }],
                name: 'phone_in_employee',
                has_many: []
            }, {
                fields: [
                    'channels_count',
                    'protocol',
                    'forwarding_timeout',
                    'app_id',
                    'phone',
                    'type',
                    {
                        name: 'id',
                        primary_key: true
                    }
                ],
                belongs_to: [],
                name: 'phone',
                has_many: [{
                    table: 'phone_in_employee',
                    foreign_key: 'phone_id'
                }]
            }]
        };

        const addResponseModifiers = me => {
            me.someGroupsHaveAccessToOtherEmployeesChats = () => {
                response.data.employee[0].other_employee_chats_access__is_select = true;
                response.data.employee[0].other_employee_chats_permission_type = 'groups';
                response.data.employee[0].other_employee_chats_permission_values = [729768, 175760];

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent: () => {
                const request = requestsManager.recentRequest().
                    expectToHavePath('/staff/employees/read/employee/104561/');

                return addResponseModifiers({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            },
        });
    };

    /*

    this.userAppPermissionRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:permission:app_user/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            }
        };
    };

    */
    this.batchReloadRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:staff:employee_licenses': [{
                                id: 'omni',
                                name: 'Омни',
                                physical_limit_type: 'max_omni_employee'
                            }],
                            'comagic:omni:employee': [
                                {
                                    "id": 568711,
                                    "name": "000011 Привет"
                                },
                                {
                                    "id": 568719,
                                    "name": "00005"
                                },
                                {
                                    "id": 2498765,
                                    "name": "789905"
                                },
                                {
                                    "id": 2498759,
                                    "name": "905"
                                },
                                {
                                    "id": 2498756,
                                    "name": "+905"
                                },
                                {
                                    "id": 7743003,
                                    "name": "alekseev_uis 1"
                                },
                                {
                                    "id": 9456574,
                                    "name": "amin"
                                },
                                {
                                    "id": 9052114,
                                    "name": "a.volgin"
                                },
                                {
                                    "id": 2002676,
                                    "name": "(bitrix24) друг Боевой"
                                },
                                {
                                    "id": 629981,
                                    "name": "(bitrix24) Иванов Иван Вано"
                                },
                                {
                                    "id": 2002139,
                                    "name": "(bitrix24) Трансфер Тестовый"
                                },
                                {
                                    "id": 2484797,
                                    "name": "chat_only_4735"
                                },
                                {
                                    "id": 2502275,
                                    "name": "Design"
                                },
                                {
                                    "id": 8987059,
                                    "name": "forvideo11111"
                                },
                                {
                                    "id": 1800650,
                                    "name": "IDCP_test1"
                                },
                                {
                                    "id": 1800656,
                                    "name": "IDCP_test2"
                                },
                                {
                                    "id": 9453109,
                                    "name": "jnxtn"
                                },
                                {
                                    "id": 8951514,
                                    "name": "Ksenya Ozerova"
                                },
                                {
                                    "id": 2294087,
                                    "name": "Kuznetsov_TEST (amoCRM)"
                                },
                                {
                                    "id": 1853573,
                                    "name": "lg4735"
                                },
                                {
                                    "id": 1980128,
                                    "name": "m.aldergotTTT m.aldergotTTT"
                                },
                                {
                                    "id": 9397079,
                                    "name": "mecawew (amoCRM)"
                                },
                                {
                                    "id": 2136806,
                                    "name": "Mikhelev Andrey"
                                },
                                {
                                    "id": 8864059,
                                    "name": "mrddost"
                                },
                                {
                                    "id": 2193848,
                                    "name": "n.alekseev4735 1"
                                },
                                {
                                    "id": 9286834,
                                    "name": "newamo (amoCRM)"
                                },
                                {
                                    "id": 8637454,
                                    "name": "popalka2"
                                },
                                {
                                    "id": 9420494,
                                    "name": "Ryabokon Dmitry"
                                },
                                {
                                    "id": 9193244,
                                    "name": "Salkov"
                                },
                                {
                                    "id": 9184029,
                                    "name": "SipVE 1"
                                },
                                {
                                    "id": 9164964,
                                    "name": "SipVE 2"
                                },
                                {
                                    "id": 8864044,
                                    "name": "Tanya"
                                },
                                {
                                    "id": 9434679,
                                    "name": "Test1new"
                                },
                                {
                                    "id": 9074904,
                                    "name": "Test (amoCRM)"
                                },
                                {
                                    "id": 2217689,
                                    "name": "testfortest"
                                },
                                {
                                    "id": 9052044,
                                    "name": "test_for_test"
                                },
                                {
                                    "id": 9242119,
                                    "name": "testnatalie test"
                                },
                                {
                                    "id": 9125579,
                                    "name": "testprodkor"
                                },
                                {
                                    "id": 9125569,
                                    "name": "testprodvl1"
                                },
                                {
                                    "id": 9053049,
                                    "name": "Vladislav_CG"
                                },
                                {
                                    "id": 9419659,
                                    "name": "А. Аскарова_int0"
                                },
                                {
                                    "id": 8705839,
                                    "name": "Автотест"
                                },
                                {
                                    "id": 2044643,
                                    "name": "адмиииииин"
                                },
                                {
                                    "id": 9061484,
                                    "name": "Александрова Анастасия"
                                },
                                {
                                    "id": 9125819,
                                    "name": "Андрей (amoCRM) Константин"
                                },
                                {
                                    "id": 9169534,
                                    "name": "Аскарова_int0"
                                },
                                {
                                    "id": 620885,
                                    "name": "Басист"
                                },
                                {
                                    "id": 1388756,
                                    "name": "Басист2"
                                },
                                {
                                    "id": 9089404,
                                    "name": "Бурмагин Максим"
                                },
                                {
                                    "id": 9117019,
                                    "name": "Гайнанов Даниял"
                                },
                                {
                                    "id": 2410760,
                                    "name": "Декина Александра"
                                },
                                {
                                    "id": 9364544,
                                    "name": "Джессика"
                                },
                                {
                                    "id": 467487,
                                    "name": "Джигит (amoCRM) nulan"
                                },
                                {
                                    "id": 2435618,
                                    "name": "Евгений1"
                                },
                                {
                                    "id": 2435621,
                                    "name": "Евгений2"
                                },
                                {
                                    "id": 1686998,
                                    "name": "Илюхин Константин"
                                },
                                {
                                    "id": 328028,
                                    "name": "Карпова Акула"
                                },
                                {
                                    "id": 1930124,
                                    "name": "кешьюP"
                                },
                                {
                                    "id": 1673750,
                                    "name": "Костя Дизайнер"
                                },
                                {
                                    "id": 9494119,
                                    "name": "К_Тест"
                                },
                                {
                                    "id": 1335734,
                                    "name": "КусьКусь (amoCRM)"
                                },
                                {
                                    "id": 9530239,
                                    "name": "Малибеков Рома"
                                },
                                {
                                    "id": 1534262,
                                    "name": "Малинин Макс"
                                },
                                {
                                    "id": 367852,
                                    "name": "Маслов Дима"
                                },
                                {
                                    "id": 9354034,
                                    "name": "Матюшин"
                                },
                                {
                                    "id": 1875485,
                                    "name": "Мехоношин Евгений"
                                },
                                {
                                    "id": 9125914,
                                    "name": "Новый для амо (amoCRM)"
                                },
                                {
                                    "id": 9358369,
                                    "name": "Попова Ира"
                                },
                                {
                                    "id": 145979,
                                    "name": "Романов Роман"
                                },
                                {
                                    "id": 9202579,
                                    "name": "Свидунович Игорь"
                                },
                                {
                                    "id": 2406383,
                                    "name": "Тестов321 Сотрудник321 Пользователевич321"
                                },
                                {
                                    "id": 2564264,
                                    "name": "Тест февраль"
                                },
                                {
                                    "id": 1534892,
                                    "name": "Хохлов Сергей Сотрудник"
                                },
                                {
                                    "id": 9074704,
                                    "name": "Юсуф Бадургов"
                                }
                            ],
                            'comagic:omni:group': [
                                {
                                    "id": 94307,
                                    "name": "060020"
                                },
                                {
                                    "id": 729768,
                                    "name": "123"
                                },
                                {
                                    "id": 593068,
                                    "name": "alekseev+testfortest"
                                },
                                {
                                    "id": 175760,
                                    "name": "amo_dzigit"
                                },
                                {
                                    "id": 179946,
                                    "name": "amo_hybrid"
                                },
                                {
                                    "id": 179944,
                                    "name": "amo_sip_dz"
                                },
                                {
                                    "id": 243444,
                                    "name": "AntonTest1"
                                },
                                {
                                    "id": 243446,
                                    "name": "AntonTest2"
                                },
                                {
                                    "id": 208694,
                                    "name": "arob3"
                                },
                                {
                                    "id": 201814,
                                    "name": "arobGr"
                                },
                                {
                                    "id": 179936,
                                    "name": "Evil_worm_amo_no_sip_group"
                                },
                                {
                                    "id": 627228,
                                    "name": "forvideo"
                                },
                                {
                                    "id": 492011,
                                    "name": "Lg"
                                },
                                {
                                    "id": 752398,
                                    "name": "m.aldergot"
                                },
                                {
                                    "id": 503945,
                                    "name": "!n.alekseev"
                                },
                                {
                                    "id": 188260,
                                    "name": "sdfsdf"
                                },
                                {
                                    "id": 794528,
                                    "name": "SIP"
                                },
                                {
                                    "id": 669218,
                                    "name": "test"
                                },
                                {
                                    "id": 677158,
                                    "name": "test200"
                                },
                                {
                                    "id": 692008,
                                    "name": "testgrpup"
                                },
                                {
                                    "id": 676018,
                                    "name": "testm200"
                                },
                                {
                                    "id": 780558,
                                    "name": "test.m200"
                                },
                                {
                                    "id": 18857,
                                    "name": "Test Maxim"
                                },
                                {
                                    "id": 718503,
                                    "name": "TESTPRODVL"
                                },
                                {
                                    "id": 657473,
                                    "name": "testrelizprod"
                                },
                                {
                                    "id": 794403,
                                    "name": "tstntl"
                                },
                                {
                                    "id": 738668,
                                    "name": "vadim va0"
                                },
                                {
                                    "id": 313163,
                                    "name": "Автотест"
                                },
                                {
                                    "id": 260861,
                                    "name": "басист"
                                },
                                {
                                    "id": 229272,
                                    "name": "битрикс"
                                },
                                {
                                    "id": 431534,
                                    "name": "Битриксробот"
                                },
                                {
                                    "id": 280961,
                                    "name": "группа басиста"
                                },
                                {
                                    "id": 464795,
                                    "name": "группа басиста для TJ"
                                },
                                {
                                    "id": 778773,
                                    "name": "Группа кампании исх. обзвона \"ИО тест\""
                                },
                                {
                                    "id": 778788,
                                    "name": "Группа кампании исх. обзвона \"ИО тест2\""
                                },
                                {
                                    "id": 778793,
                                    "name": "Группа кампании исх. обзвона \"ИО тест3\""
                                },
                                {
                                    "id": 778803,
                                    "name": "Группа кампании исх. обзвона \"ИО тест4\""
                                },
                                {
                                    "id": 280382,
                                    "name": "Группа Пузослава"
                                },
                                {
                                    "id": 683123,
                                    "name": "Джигит/Друг"
                                },
                                {
                                    "id": 654623,
                                    "name": "дубль"
                                },
                                {
                                    "id": 605683,
                                    "name": "женя2"
                                },
                                {
                                    "id": 416822,
                                    "name": "Женя(группа)"
                                },
                                {
                                    "id": 475061,
                                    "name": "кусьгр"
                                },
                                {
                                    "id": 594018,
                                    "name": "Мехоношин"
                                },
                                {
                                    "id": 238902,
                                    "name": "Не беспокоить"
                                },
                                {
                                    "id": 662433,
                                    "name": "Новая"
                                },
                                {
                                    "id": 784513,
                                    "name": "Отдел продаж"
                                },
                                {
                                    "id": 368612,
                                    "name": "пра"
                                },
                                {
                                    "id": 279605,
                                    "name": "Сотрудники Пузослава"
                                },
                                {
                                    "id": 392540,
                                    "name": "Тест десктопа"
                                },
                                {
                                    "id": 274799,
                                    "name": "Тест Лиценз"
                                },
                                {
                                    "id": 215766,
                                    "name": "тестовые Джигиты амо"
                                },
                                {
                                    "id": 214038,
                                    "name": "транк_00001"
                                },
                                {
                                    "id": 779478,
                                    "name": "Хохлов СВ"
                                },
                                {
                                    "id": 695013,
                                    "name": "ыквапро"
                                }
                            ],
                            /*
                            'comagic:staff:employee_for_call_recording': [],
                            'comagic:staff:phones_in_employee': [],
                            'comagic:staff:employees_in_phone': [],
                            'comagic:sip:sip_line': [],
                            'comagic:staff:group': [],
                            'comagic:staff:position': [],
                            'comagic:_tree:employees': [],
                            'billing:public:number_capacity': [],
                            'comagic:public:call_type': [{
                                id: 'external',
                                name: 'Внешние'
                            }, {
                                id: 'internal',
                                name: 'Внутренние'
                            }],
                            'comagic:staff:employee': [{
                                aux_id: [],
                                aux_id2: true,
                                aux_id3: null,
                                call_center_role: null,
                                has_va: false,
                                id: -1,
                                is_active: false,
                                is_consultant_call: false,
                                is_consultant_chat: false,
                                is_consultant_offline_message: false,
                                is_manage_allowed: false,
                                name: 'Не задан'
                            }]
                            */
                        }
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.tab = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().matchesSelector('.x-tab-inner').textEquals(text).find()
        );
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


    this.combobox = label => testersFactory.createComboBoxTester(utils.getComponentByDomElement(field(label)));

    this.grid = label => {
        const getElement = () => field(label).closest('.x-grid'),
            tester = testersFactory.createGridTester(() => utils.getComponentByDomElement(getElement()));

        tester.closeButton = testersFactory.createDomElementTester(() => getElement().querySelector('.x-tool-close'));
        return tester;
    };

    this.tags = label => {
        const getElement = () => field(label),
            tester = testersFactory.createDomElementTester(getElement);

        tester.addButton = testersFactory.createDomElementTester(
            () => getElement().querySelector('.ul-btn-usual-icon-cls-plus')
        );

        return tester;
    };

    /*
    this.form = testersFactory.createFormTester(function () {
        return Comagic.getApplication().findComponent('services-ats-staff-contactrecordform');
    });
    */

    this.button = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                matchesSelector('.x-btn-inner').
                textEquals(text).
                find()
        );
    };
}
