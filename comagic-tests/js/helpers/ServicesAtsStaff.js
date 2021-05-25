tests.requireClass('Comagic.services.ats.staff.store.ContactRecord');
tests.requireClass('Comagic.services.ats.staff.controller.ContactEditPage');

function ServicesAtsStaff(requestsManager, testersFactory, utils) {
    ServicesAtsStaff.makeOverrides = function () {
        Ext.define('Comagic.test.services.ats.staff.view.ContactEditPage', {
            override: 'Comagic.services.ats.staff.view.ContactEditPage',
            autoScroll: true
        });

        ServicesAtsStaff.makeOverrides = Ext.emptyFn;
    };

    ServicesAtsStaff.makeOverrides();

    var controller = Comagic.getApplication().getController('Comagic.services.ats.staff.controller.ContactEditPage');

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.employeeUserAddingRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/add_employee_user/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        id: 104561,
                        data: {
                            login: 'chenkova',
                            password: 'Qwerty123'
                        }
                    }).
                    respondSuccessfullyWith({
                        data: [],
                        success: true
                    });
            }
        };
    };

    this.softphoneLoginValidationRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/validate_softphone_login/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        login: ['chenkova']
                    }).
                    respondSuccessfullyWith({
                        data: [],
                        success: true
                    });
            }
        };
    };

    this.employeeUserRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/get_employee_user/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            limit: {
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

    function getEmployeeData (callback) {
        var data = {
            coach: [],
            employee: [{
                in_external_allowed_call_directions: ['in', 'out'],
                in_internal_allowed_call_directions: ['in'],
                out_internal_allowed_call_directions: ['out'],
                out_external_allowed_call_directions: [],
                allowed_in_call_types: [
                    'external',
                    'internal'
                ],
                allowed_out_call_types: [
                    'external',
                    'internal'
                ],
                app_id: 4735,
                avatar_height: null,
                avatar_key: null,
                avatar_link: null,
                avatar_offset_left: null,
                avatar_offset_top: null,
                avatar_source_key: null,
                avatar_source_link: null,
                avatar_width: null,
                boss_id: null,
                categories: [],
                consultant_operator_display_name: null,
                email: 'v.chenkova@gmail.com',
                employee_linked_to_user: 'Веселина Ченкова',
                first_name: 'Виселина',
                goals: [],
                has_password: false,
                has_sip: false,
                id: 104561,
                is_all_sites_access: true,
                is_auto_status_enabled: false,
                is_consultant_chat: false,
                is_consultant_invite: false,
                is_consultant_offline_message: false,
                is_consultant_operator: false,
                is_consultant_operator_active: false,
                is_need_out_call_rating: false,
                last_name: 'Ченкова',
                login: '',
                not_at_work_interval: '01:00:00',
                operator_status: null,
                password: null,
                patronymic: 'Добриновна',
                position_id: null,
                position_name: null,
                record_talk_direction: 'all',
                schedule_id: null,
                sites: []
            }],
            phone: [{
                app_id: 4735,
                channels_count: 1,
                forwarding_timeout: 60,
                id: 230006,
                phone: '060091',
                protocol: 'PSTN',
                type: 'work'
            }],
            phone_in_employee: [{
                channels_count: 53,
                employee_id: 637279,
                forwarding_timeout: 60,
                id: 784188,
                is_active: true,
                phone: '1234',
                phone_id: 985720,
                priority: 1,
                protocol: 'PSTN',
                schedule_id: null
            }],
            short_phone: [],
            sites_in_employee: [],
        };

        (callback || function () {})(data);

        return data;
    }

    this.employeeChangeRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/employee/change/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        employee: {
                            create: [],
                            update: [{
                                first_name: 'Веселина',
                                is_need_hide_numbers: true
                            }],
                            destroy: []
                        },
                        sites_in_employee: {
                            create: [],
                            update: [],
                            destroy: []
                        },
                        coach: {
                            create: [],
                            update: [],
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
                        short_phone: {
                            create: [],
                            update: [],
                            destroy: []
                        }
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: getEmployeeData(function (data) {
                            data.employee[0].first_name = 'Веселина';
                            data.employee[0].is_need_hide_numbers = true;
                        })
                    });
            }
        };
    };

    this.employeesRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/employee/read/employee/104561/').
                    respondSuccessfullyWith({
                        success: true,
                        data: getEmployeeData(),
                        metadata: [{
                            fields: [
                                'consultant_operator_display_name',
                                'last_name',
                                'avatar_height',
                                'position_id',
                                'avatar_offset_left',
                                'app_id',
                                'sites',
                                'patronymic',
                                'schedule_id',
                                'has_password',
                                'position_name',
                                'is_consultant_operator',
                                'boss_id',
                                'record_talk_direction',
                                {
                                    name: 'id',
                                    primary_key: true
                                },
                                'is_all_sites_access',
                                'first_name',
                                'password',
                                'avatar_link',
                                'call_center_role',
                                'out_internal_allowed_call_directions',
                                'is_need_hide_numbers',
                                'is_need_out_call_rating',
                                'avatar_source_link',
                                'is_consultant_invite',
                                'email',
                                'avatar_offset_top',
                                'out_external_allowed_call_directions',
                                'email_for_user_info',
                                'operator_status',
                                'is_consultant_operator_active',
                                'goals',
                                'is_auto_status_enabled',
                                'avatar_key',
                                'manager_group_ids',
                                'categories',
                                'buy_another_call_center_role',
                                'not_at_work_interval',
                                'avatar_width',
                                'in_internal_allowed_call_directions',
                                'is_consultant_offline_message',
                                'avatar_source_key',
                                'has_sip',
                                'in_external_allowed_call_directions',
                                'login',
                                'is_consultant_chat',
                                'employee_linked_to_user',
                                'manager_employee_ids'
                            ],
                            belongs_to: [],
                            name: 'employee',
                            has_many: [{
                                table: 'sites_in_employee',
                                foreign_key: 'employee_id'
                            }, {
                                table: 'coach',
                                foreign_key: 'employee_id'
                            }, {
                                table: 'phone_in_employee',
                                foreign_key: 'employee_id'
                            }, {
                                table: 'short_phone',
                                foreign_key: 'employee_id'
                            }]
                        }, {
                            fields: [
                                'employee_id',
                                'site_id',
                                {
                                    name: 'id',
                                    primary_key: true
                                }
                            ],
                            belongs_to: [{
                                table: 'employee',
                                foreign_key: 'employee_id'
                            }],
                            name: 'sites_in_employee',
                            has_many: []
                        }, {
                            fields: [
                                'employee_id',
                                'is_called_always',
                                {
                                    name: 'id',
                                    primary_key: true
                                },
                                'coach_employee_id'
                            ],
                            belongs_to: [{
                                table: 'employee',
                                foreign_key: 'employee_id'
                            }],
                            name: 'coach',
                            has_many: []
                        }, {
                            fields: [
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
                                {
                                    name: 'id',
                                    primary_key: true
                                },
                                'sip_trunk_destination_number'
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
                        }, {
                            fields: [
                                'employee_id',
                                'app_id',
                                'is_queue',
                                'phone',
                                'is_voice_mail',
                                {
                                    name: 'id',
                                    primary_key: true
                                }
                            ],
                            belongs_to: [{
                                table: 'employee',
                                foreign_key: 'employee_id'
                            }],
                            name: 'short_phone',
                            has_many: []
                        }]
                    });
            }
        };
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
        return utils.descendantOfBody().
            matchesSelector('.x-form-item-label-inner').
            textEquals(label).
            find().
            closest('.x-field').
            querySelector(selector);
    }

    this.switchbox = function (label) {
        return testersFactory.createDomElementTester(field(label, 'a.x-form-switchbox'));
    };

    this.form = testersFactory.createFormTester(function () {
        return Comagic.getApplication().findComponent('services-ats-staff-contactrecordform');
    });

    this.button = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                matchesSelector('.x-btn-inner').
                textEquals(text).
                find()
        );
    };
}
