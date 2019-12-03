tests.requireClass('Comagic.services.ats.staff.store.ContactRecord');
tests.requireClass('Comagic.services.ats.staff.controller.ContactEditPage');

function ServicesAtsStaff(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.services.ats.staff.controller.ContactEditPage');

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.requestEmployees = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/employee/read/employee/104561/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            coach: [],
                            employee: [{
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
                                first_name: 'Веселина',
                                goals: [],
                                has_password: false,
                                has_sip: false,
                                id: 637279,
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
                            metadata: null,
                            success: true
                        }
                    });
            }
        };
    };

    this.batchReloadRequest = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:public:call_type': [{
                                id: 'external',
                                name: 'Внешние'
                            }, {
                                id: 'internal',
                                name: 'Внутренние'
                            }]
                        }
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
